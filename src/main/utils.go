package main

import (
	"bytes"
	"os"
	"os/exec"
)

func Exist(filename string) bool {
	_, err := os.Stat(filename)
	return err == nil || os.IsExist(err)
}

func System(s string, output *bytes.Buffer) {
	cmd := exec.Command("/bin/sh", "-c", s)
	cmd.Stdout = output
	err := cmd.Run()
	if err != nil {
		logger.Println("[System] command failed:", err)
	}
}
