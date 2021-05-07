// set test environment/ connects to test db in configs folder
process.env.NODE_ENV === "test"

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book")

const testBook = {
            "isbn": "0692342349518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 98537,
            "publisher": "Princeton University Press",
            "title": "Test1",
            "year": 2008
        }
    
beforeEach(async function () {
    await db.query("DELETE FROM books");

    await Book.create(testBook)
});

describe("GET /books", () => {
    test("gets all books", async () => {
        const res = await request(app).get("/books");
        expect(res.statusCode).toBe(200);
    })
})

describe("GET /books", () => {
    test("gets single book", async () => {
        const res = await request(app).get(`/books/${testBook.isbn}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.book.year).toBe(2008)
    })
    test("gets invalid book", async () => {
        const res = await request(app).get(`/books/123`);
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toEqual({ message: "There is no book with an isbn '123", status: 404 });
    })
})

describe("POST /books", () => {

    const testBook2 = {
            "isbn": "1234567890",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew One",
            "language": "english",
            "pages": 1,
            "publisher": "Princeton University Press",
            "title": "1 Page Book",
            "year": 2001
    }
    
    test("create a new book", async () => {
        const res = await request(app)
            .post("/books") /* connects POST /books to create a new book */
            .send(testBook2)/* Data to send to endpoint*/
        expect(res.statusCode).toBe(201);
        expect(res.body.book.isbn).toEqual(`${testBook2.isbn}`)
    })

    test("create a duplicate book", async () => {
        const res = await request(app)
            .post("/books") /* connects POST /books to create a new book */
            .send(testBook)/* Data to send to endpoint*/
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toEqual(`duplicate key value violates unique constraint "books_pkey"`)
    });


})

describe("PUT /books/:isbn", async () => {
    test("updating an existing book", async () => {
        const res = await request(app)
            .put(`/books/${testBook.isbn}`)
            .send({
                "isbn": "0692342349518",
                "amazon_url": "http://a.co/eobPtX2",
                "author": "Matthew Lane",
                "language": "english",
                "pages": 369,
                "publisher": "Princeton University Press",
                "title": "Updated title of book",
                "year": 2018
            })

        expect(res.statusCode).toBe(200);
        expect(res.body.book.title).toEqual(`Updated title of book`)
    })

    test("Update a non existing book ", async function () {
        const response = await request(app)
            .put(`/books/23232323`)
            .send({
                isbn: "32794782",
                badField: "DO NOT ADD ME!",
                amazon_url: "https://taco.com",
                author: "mctest",
                language: "english",
                pages: 1000,
                publisher: "yeah right",
                title: "UPDATED BOOK",
                year: 2000
            });
        expect(response.statusCode).toBe(404);
    })
    
});

afterAll(async function () {
    await db.end();
});
