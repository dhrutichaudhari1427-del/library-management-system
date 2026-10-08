const bookForm = document.getElementById("bookForm");

const bookList = document.getElementById("bookList");


// ====================================
// LOAD BOOKS
// ====================================

async function loadBooks() {

    const search =
        document.getElementById("searchBox").value;

    try {

        const response =
            await fetch(
                "/api/books?search=" +
                encodeURIComponent(search)
            );

        const books = await response.json();

        bookList.innerHTML = "";

        books.forEach(book => {

            const row =
                document.createElement("tr");


            let statusBadge = "";

            if (book.status === "Available") {

                statusBadge =
                    `<span class="badge bg-success">
                        Available
                    </span>`;

            } else {

                statusBadge =
                    `<span class="badge bg-warning text-dark">
                        Issued
                    </span>`;

            }


            let issueButton = "";

            if (book.status === "Available") {

                issueButton =
                    `<button
                        class="btn btn-success btn-sm"
                        onclick="issueBook('${book._id}')">

                        Issue

                    </button>`;

            } else {

                issueButton =
                    `<button
                        class="btn btn-info btn-sm"
                        onclick="returnBook('${book._id}')">

                        Return

                    </button>`;

            }


            row.innerHTML = `

                <td>${book.title}</td>

                <td>${book.author}</td>

                <td>${book.category}</td>

                <td>${book.year}</td>

                <td>${statusBadge}</td>

                <td>

                    <button
                        class="btn btn-warning btn-sm"
                        onclick="editBook('${book._id}')">

                        Edit

                    </button>

                    ${issueButton}

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="deleteBook('${book._id}')">

                        Delete

                    </button>

                </td>

            `;

            bookList.appendChild(row);

        });


        loadStats();

    } catch (error) {

        console.log(error);

    }

}


// ====================================
// ADD / UPDATE BOOK
// ====================================

bookForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    const id =
        document.getElementById("bookId").value;

    const book = {

        title:
            document.getElementById("title").value,

        author:
            document.getElementById("author").value,

        category:
            document.getElementById("category").value,

        year:
            document.getElementById("year").value

    };


    try {

        let response;


        if (id === "") {

            response = await fetch(
                "/api/books",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(book)
                }
            );

        } else {

            response = await fetch(
                "/api/books/" + id,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(book)
                }
            );

        }


        if (response.ok) {

            alert(
                id === ""
                    ? "Book added successfully!"
                    : "Book updated successfully!"
            );

            bookForm.reset();

            cancelEdit();

            loadBooks();

        } else {

            alert("Operation failed.");

        }

    } catch (error) {

        console.log(error);

    }

});


// ====================================
// EDIT BOOK
// ====================================

async function editBook(id) {

    const response =
        await fetch("/api/books");

    const books =
        await response.json();

    const book =
        books.find(item => item._id === id);


    if (!book) {
        return;
    }


    document.getElementById("bookId").value =
        book._id;

    document.getElementById("title").value =
        book.title;

    document.getElementById("author").value =
        book.author;

    document.getElementById("category").value =
        book.category;

    document.getElementById("year").value =
        book.year;


    document.getElementById("formTitle").innerText =
        "Update Book";

    document.getElementById("submitButton").innerText =
        "Update Book";

    document.getElementById("cancelButton").style.display =
        "inline-block";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ====================================
// CANCEL EDIT
// ====================================

function cancelEdit() {

    document.getElementById("bookId").value = "";

    document.getElementById("bookForm").reset();

    document.getElementById("formTitle").innerText =
        "Add New Book";

    document.getElementById("submitButton").innerText =
        "Add Book";

    document.getElementById("cancelButton").style.display =
        "none";

}


// ====================================
// DELETE BOOK
// ====================================

async function deleteBook(id) {

    if (!confirm("Are you sure you want to delete this book?")) {
        return;
    }


    const response =
        await fetch(
            "/api/books/" + id,
            {
                method: "DELETE"
            }
        );


    if (response.ok) {

        alert("Book deleted successfully!");

        loadBooks();

    }

}


// ====================================
// ISSUE BOOK
// ====================================

async function issueBook(id) {

    const issuedTo =
        prompt("Enter student name:");

    if (!issuedTo) {
        return;
    }


    const response =
        await fetch(
            "/api/books/" + id + "/issue",
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    issuedTo: issuedTo
                })
            }
        );


    if (response.ok) {

        alert("Book issued successfully!");

        loadBooks();

    }

}


// ====================================
// RETURN BOOK
// ====================================

async function returnBook(id) {

    if (!confirm("Return this book?")) {
        return;
    }


    const response =
        await fetch(
            "/api/books/" + id + "/return",
            {
                method: "PATCH"
            }
        );


    if (response.ok) {

        alert("Book returned successfully!");

        loadBooks();

    }

}


// ====================================
// DASHBOARD STATISTICS
// ====================================

async function loadStats() {

    const response =
        await fetch("/api/stats");

    const stats =
        await response.json();


    document.getElementById("totalBooks").innerText =
        stats.total;

    document.getElementById("availableBooks").innerText =
        stats.available;

    document.getElementById("issuedBooks").innerText =
        stats.issued;

}


// ====================================
// INITIAL LOAD
// ====================================

loadBooks();