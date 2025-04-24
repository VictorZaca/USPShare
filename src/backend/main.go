package main

import (
	"log"
	"github.com/gofiber/fiber/v2"
	"fmt"
)

func main() {
	// fmt.Println("Hello, World!")
	// var myName string = "John Doe"
	// const mySecondName string = "Jane Doe"

	// myThirdName := "John Smith"
	// fmt.Println(myName)
	// fmt.Println(mySecondName)
	// fmt.Println(myThirdName)
	fmt.Println("Hello, World!")
	app := fiber.New()

	log.Fatal(app.Listen(":4000"))
}