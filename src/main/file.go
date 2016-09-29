package main

import "os"

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
