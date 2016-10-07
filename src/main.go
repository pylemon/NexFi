package main

import (
	"encoding/json"
	"flag"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"runtime/debug"
	"sync"
	"syscall"
	"time"
	"strings"
	"encoding/base64"
	"bytes"
	"encoding/gob"
	"path"
	"errors"
	"os/exec"
	"html/template"
	"net/url"
)

// 全局配置结构
type GlobalConfig struct {
	LogFile       string `json:"log_file"`
	ListenAddress string `json:"listen_address"`
	ConfigFile    string `json:"config"`
	LogToStdout   bool   `json:"log_to_stdout"`
	Username      string `json:"username"`
	Password      string `json:"password"`
	VisCommand    string `json:"vis_command"`
	IpInfoFile    string `json:"ip_info_file"`

	Lock          *sync.Mutex
}

// 全局变量
var (
	// 全局的logger 在配置初始化前需要使用 log
	logger *log.Logger
	// 处理信号的channel
	signal_chan chan os.Signal

	LogFile       = flag.String("log_file", "", "logging file, default: server.log")
	ListenAddress = flag.String("listen_address", "", "server listen on, default: 0.0.0.0:8888")
	ConfigFile    = flag.String("config", "./config.json", "")
	LogToStdout   = flag.Bool("log_to_stdout", false, "Log to standard output (true or false).")
	VisCommand    = flag.String("vis_command", "batadv-vis -f jsondoc", "command to generate vis output, default: batadv-vis -f jsondoc")
	Username      = flag.String("username", "admin", "login username, default: admin")
	Password      = flag.String("password", "admin", "login password, default: admin")
	IpInfoFile = flag.String("ip_info_file", "", "ip info file, default: ip_info.json")
	IpInfoData IpInfo
	Config GlobalConfig
)

func init() {
	var log_file *os.File
	var err error

	// 载入配置
	Config.Lock = new(sync.Mutex)
	flag.Parse()

	if *LogFile == "" {
		*LogFile = "./server.log"
	}
	if *IpInfoFile == "" {
		*IpInfoFile = "./ip_info.json"
	}
	if *ListenAddress == "" {
		*ListenAddress = "0.0.0.0:8888"
	}
	if *Username == "" {
		*Username = "admin"
	}
	if *Password == "" {
		*Password = "admin"
	}
	if *VisCommand == "" {
		*VisCommand = "batadv-vis -f jsondoc"
	}

	if !FileExists(*ConfigFile) {
		Config.LogFile = *LogFile
		Config.IpInfoFile = *IpInfoFile
		Config.ListenAddress = *ListenAddress
		Config.LogToStdout = *LogToStdout
		Config.Username = *Username
		Config.Password = *Password
		Config.VisCommand = *VisCommand
	} else {
		data, err := ioutil.ReadFile(*ConfigFile)
		if err != nil {
			log.Println(err)
			return
		}
		err = json.Unmarshal(data, &Config)
		if err != nil {
			log.Println(err)
		}
		log.Printf("Load config from: %s\n%s", *ConfigFile, data)
	}

	// 初始化日志
	if !(Config.LogToStdout) {
		log_file, err = os.OpenFile(Config.LogFile, os.O_RDWR|os.O_APPEND|os.O_CREATE, 0666)
		if err != nil {
			log.Println(err)
			os.Exit(1)
		}
	} else {
		log_file = os.Stdout
	}
	logger = log.New(log_file, "", log.Ldate|log.Ltime|log.Lshortfile)

	// 初始化ip关联配置
	if !FileExists(Config.IpInfoFile) {
		IpInfoData = IpInfo{}
	} else {
		data, err := ioutil.ReadFile(Config.IpInfoFile)
		if err != nil {
			log.Println(err)
			IpInfoData = IpInfo{}
		}
		err = json.Unmarshal(data, &IpInfoData)
		if err != nil {
			log.Println(err)
			IpInfoData = IpInfo{}
		}
		log.Printf("Load ip info from file: %s", data)
	}
}

// 信号回调
func signalCallback() {
	for s := range signal_chan {
		sig := s.String()
		logger.Println("Got Signal: " + sig)

		if s == syscall.SIGINT || s == syscall.SIGTERM {
			logger.Println("Server exit...")
			os.Exit(0)
		}
	}
}

func main() {
	defer func() {
		if err := recover(); err != nil {
			logger.Println(err)
			debug.PrintStack()
		}
	}()
	runtime.GOMAXPROCS(runtime.NumCPU())
	// HOLD住POSIX SIGNAL
	signal_chan = make(chan os.Signal, 10)
	signal.Notify(signal_chan,
		syscall.SIGHUP,
		syscall.SIGINT,
		syscall.SIGTERM,
		syscall.SIGQUIT,
		syscall.SIGPIPE,
		syscall.SIGALRM,
		syscall.SIGBUS,
		syscall.SIGCHLD,
		syscall.SIGCONT,
		syscall.SIGFPE,
		syscall.SIGILL,
		syscall.SIGIO,
		syscall.SIGIOT,
		syscall.SIGPROF,
		syscall.SIGSEGV,
		syscall.SIGSTOP,
		syscall.SIGSYS,
		syscall.SIGTRAP,
		syscall.SIGURG,
		syscall.SIGUSR1,
		syscall.SIGUSR2)

	go signalCallback()

	initRouter()
	s := &http.Server{
		Addr:           Config.ListenAddress,
		Handler:        nil,
		ReadTimeout:    60 * time.Second,
		WriteTimeout:   60 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}
	logger.Printf("Server [PID: %d] listen on [%s]\n", os.Getpid(), Config.ListenAddress)
	logger.Println(s.ListenAndServe())

}

func initRouter() {
	// 路由初始化
	auth := NewBasicAuth(Config.Username, Config.Password)
	http.Handle("/css/", http.FileServer(http.Dir("template")))
	http.Handle("/js/", http.FileServer(http.Dir("template")))

	http.HandleFunc("/", auth.Wrap(homeHandler))
	http.HandleFunc("/topo/vis", auth.Wrap(topoVisHandler))
	http.HandleFunc("/topo/position", auth.Wrap(topoPositionHandler))
	http.HandleFunc("/node", auth.Wrap(nodeDetailHandler))
	http.HandleFunc("/config", auth.Wrap(configHandler))
}

// 登陆验证 /////////////////////////////////////////////////////////////////////////////////////////////////////////////
type BasicAuth struct {
	username string
	password string
}

type BasicHandlerFunc func(http.ResponseWriter, *http.Request)

func (a *BasicAuth) CheckAuth(r *http.Request) bool {
	s := strings.SplitN(r.Header.Get("Authorization"), " ", 2)
	if len(s) != 2 {
		return false
	}

	b, err := base64.StdEncoding.DecodeString(s[1])
	if err != nil {
		return false
	}

	pair := strings.SplitN(string(b), ":", 2)
	if len(pair) != 2 {
		return false
	}

	return pair[0] == a.username && pair[1] == a.password
}

func (a *BasicAuth) Wrap(wrapped BasicHandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if ok := a.CheckAuth(r); ok {
			wrapped(w, r)
		} else {
			logger.Println("auth failed!")
			w.Header().Set("WWW-Authenticate", `Basic realm="MY REALM"`)
			w.WriteHeader(401)
			w.Write([]byte("401 Unauthorized\n"))
		}
	}
}

func NewBasicAuth(username, password string) *BasicAuth {
	return &BasicAuth{username, password}
}

// 路由模块 /////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 渲染首页模板

type IpInfo struct {
	NexFi []NexFiData `json:"nexfi"`
}

type NexFiData struct {
	Adhoc0    string `json:"adhoc0"`
	Brlan     string `json:"br-lan"`
	Eth1      string `json:"eth1"`
	Ipaddress string `json:"ipaddress"`
	No        string `json:"no"`
}

type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
}
type Node struct {
	Name     string   `json:"name"`
	Position Position `json:"position"`
}

type VisPositionData struct {
	Nodes []Node `json:"nodes"`
}

type ConfigData struct {
	Title string `json:"title"`
}

type Response struct {
	Status string `json:"status"`
}

func getDatabase(name string, objPrototypeGenerator func() interface{}) *DB {
	db := NewDB(
		name,
		objPrototypeGenerator)
	db.Init()
	return db
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	logger.Println("GET / homeHandler")
	t, err := template.ParseFiles("template/html/topo.html")
	if err != nil {
		logger.Println(err)
	}
	t.Execute(w, nil)
}

// 获取拓扑结构的JSON数据
func topoVisHandler(w http.ResponseWriter, r *http.Request) {
	logger.Println("GET /topo/vis topoVisHandler")
	defer func() {
		if err := recover(); err != nil {
			logger.Println(err)
			debug.PrintStack()
		}
	}()

	var out bytes.Buffer
	//logger.Println("[vis] cmd:", Config.VisCommand)
	System(Config.VisCommand, &out)
	//logger.Println("[vis] response:", out.String())
	w.Header().Set("Content-Type", "application/json")
	w.Write(out.Bytes())
}

func nodeDetailHandler(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			logger.Println(err)
			debug.PrintStack()
		}
	}()
	if r.Method == "GET" {
		logger.Println("GET /node nodeDetailHandler")

		var resp NexFiData
		queryForm, err := url.ParseQuery(r.URL.RawQuery)
		if err == nil && len(queryForm["macAddr"]) > 0 {
			macAddr := queryForm["macAddr"][0]

			//logger.Println("GET params: ", macAddr)

			for _, ip := range IpInfoData.NexFi {
				if macAddr == ip.Adhoc0 {
					resp = ip
					break
				}
			}
		}
		buf, err := json.Marshal(resp)
		if err != nil {
			http.Error(w, "Marshal JSON failed", 500)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(buf)
	}
}

func configHandler(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			logger.Println(err)
			debug.PrintStack()
		}
	}()
	db := getDatabase(
		"config",
		func() interface{} {
			var dt ConfigData
			return &dt
		})

	if r.Method == "GET" {
		logger.Println("GET /config configHandler")

		db.Get("title")
		value := db.Get("title")
		if value == nil {
			value = ConfigData{}
		}
		buf, err := json.Marshal(value)
		if err != nil {
			http.Error(w, "Marshal JSON failed", 500)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(buf)
	} else {
		logger.Println("POST /config configHandler")
		var dt ConfigData
		decoder := json.NewDecoder(r.Body)
		err := decoder.Decode(&dt)
		if err != nil {
			logger.Println(err)
		}

		db.Update("title", dt)

		resp := Response{"ok"}
		buf, _ := json.Marshal(resp)
		w.Header().Set("Content-Type", "application/json")
		w.Write(buf)
	}
}

func topoPositionHandler(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if err := recover(); err != nil {
			logger.Println(err)
			debug.PrintStack()
		}
	}()
	db := getDatabase(
		"topo",
		func() interface{} {
			var vis VisPositionData
			return &vis
		})

	if r.Method == "POST" {
		logger.Println("POST /topo/position topoPositionHandler")
		var dt VisPositionData
		decoder := json.NewDecoder(r.Body)
		err := decoder.Decode(&dt)
		if err != nil {
			logger.Println(err)
		}
		db.Update("position", dt)

		logger.Println("save position to db:", dt)

		resp := Response{"ok"}
		buf, err := json.Marshal(resp)
		w.Header().Set("Content-Type", "application/json")
		w.Write(buf)
	} else {
		logger.Println("GET /topo/position topoPositionHandler")

		value := db.Get("position")
		if value == nil {
			value = VisPositionData{}
		}

		logger.Println("position from db:", value)

		buf, err := json.Marshal(value)
		if err != nil {
			http.Error(w, "Marshal JSON failed", 500)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(buf)
	}
}

// 本地文件数据库 ////////////////////////////////////////////////////////////////////////////////////////////////////////
var g_debug = false

func debugOutput(args ...interface{}) {
	if g_debug {
		logger.Println(args)
	}
}

var default_db_root_path = "./gobdb"

func NewDB(name string, objPrototypeGenerator func() interface{}) *DB {
	if len(name) <= 0 {
		name = "demo"
	}

	location := path.Join(default_db_root_path, name)
	if objPrototypeGenerator == nil {
		objPrototypeGenerator = func() interface{} {
			var s string
			return &s
		}
	}
	db := &DB{
		location:           location,
		Name:               name,
		ObjectsMap:         make(map[string]interface{}),
		prototypeGenerator: objPrototypeGenerator,
	}
	return db
}

type DB struct {
	location           string
	Name               string
	ObjectsMap         map[string]interface{}
	prototypeGenerator func() interface{}
}

func (db *DB) Init() (*DB, error) {
	debugOutput("db location => ", db.location)
	if FileExists(db.location) == false || FileIsDir(db.location) == false {
		debugOutput("location not exists: ", db.location)
		if err := os.MkdirAll(db.location, os.ModePerm); err != nil {
			return nil, err
		}
	}

	if files, err := ListDirFiles(db.location); err != nil {
		return nil, err
	} else {
		debugOutput("files: ", files)
		StringMap(func(file string) {
			filePath := path.Join(db.location, file)
			obj := db.prototypeGenerator()
			if err := readFile(filePath, obj); err != nil {
				return
			}
			debugOutput("gobdb => load file ", file, " ", obj)
			db.ObjectsMap[file] = obj

		}, files)
	}
	return db, nil
}

func readFile(path string, obj interface{}) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()
	dec := gob.NewDecoder(file)
	err2 := dec.Decode(obj)

	if err2 != nil {
		return err2
	}
	return nil
}

func (db *DB) Update(key string, value interface{}) error {
	err := db.Delete(key)
	if err != nil {
		return err
	}
	return db.Put(key, value)
}

func (db *DB) Put(key string, value interface{}) error {
	filePath := path.Join(db.location, key)
	if FileExists(filePath) == true {
		return errors.New("file already exists")
	}
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	enc := gob.NewEncoder(file)
	err = enc.Encode(value)
	if err != nil {
		return err
	}
	db.ObjectsMap[key] = value
	return nil
}

func (db *DB) Get(key string) interface{} {
	if _, ok := db.ObjectsMap[key]; ok {
		return db.ObjectsMap[key]
	} else {
		return nil
	}
}

func (db *DB) Has(key string) bool {
	_, ok := db.ObjectsMap[key]
	return ok
}

func (db *DB) Delete(key string) error {
	if db.Has(key) == true {
		dbFilePath := path.Join(db.location, key)
		if FileExists(dbFilePath) == false {
			return nil
		}
		if err := os.Remove(dbFilePath); err != nil {
			return err
		}
		delete(db.ObjectsMap, key)
	}
	return nil
}

func (db *DB) Count() int {
	return len(db.ObjectsMap)
}

func (db *DB) DB_FileExists(name string) bool {
	filePath := path.Join(db.location, name)
	return FileExists(filePath)
}

// 工具函数 /////////////////////////////////////////////////////////////////////////////////////////////////////////////
func FileExists(filename string) bool {
	_, err := os.Stat(filename)
	return err == nil
}

func FileIsDir(dirname string) bool {
	info, err := os.Stat(dirname)
	return err == nil && info.IsDir()
}

func ListDirFiles(dir string) ([]string, error) {
	f, err := os.Open(dir)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	fileInfos, err := f.Readdir(-1)
	if err != nil {
		return nil, err
	}
	result := make([]string, 0, len(fileInfos))
	for i := range fileInfos {
		if !fileInfos[i].IsDir() {
			result = append(result, fileInfos[i].Name())
		}
	}
	return result, nil
}

func StringMap(f func(string), data []string) {
	size := len(data)
	for i := 0; i < size; i++ {
		f(data[i])
	}
}

func System(s string, output *bytes.Buffer) {
	cmd := exec.Command("/bin/sh", "-c", s)
	cmd.Stdout = output
	err := cmd.Run()
	if err != nil {
		logger.Println("[System] command failed:", err)
	}
}
