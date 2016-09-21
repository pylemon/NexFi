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
)

// 全局配置结构
type GlobalConfig struct {
	LogFile       string `json:"log_file"`
	ListenAddress string `json:"listen_address"`
	ConfigFile    string `json:"config"`
	LogToStdout   bool   `json:"log_to_stdout"`

	Lock *sync.Mutex
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

	Config GlobalConfig
)

func init() {
	var log_file *os.File
	var err error

	// 载入配置
	Config.Lock = new(sync.Mutex)
	flag.Parse()

	if !Exist(*ConfigFile) {
		if *LogFile == "" {
			*LogFile = "./server.log"
		}
		if *ListenAddress == "" {
			*ListenAddress = "0.0.0.0:8888"
		}

		Config.LogFile = *LogFile
		Config.ListenAddress = *ListenAddress
		Config.LogToStdout = *LogToStdout
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

		// 参数优先级高于配置文件
		if *LogFile != "" {
			Config.LogFile = *LogFile
		}
		if *ListenAddress != "" {
			Config.ListenAddress = *ListenAddress
		}
		if *LogToStdout {
			Config.LogToStdout = *LogToStdout
		}
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
		syscall.SIGPIPE,
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

	s := &http.Server{
		Addr:           Config.ListenAddress,
		Handler:        nil,
		ReadTimeout:    60 * time.Second,
		WriteTimeout:   60 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}
	logger.Printf("Server [PID: %d] listen on [%s]\n", os.Getpid(), Config.ListenAddress)
	logger.Fatal(s.ListenAndServe())
}
