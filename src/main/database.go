package main

import (
	"encoding/gob"
	"errors"
	"os"
	"path"
)

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
