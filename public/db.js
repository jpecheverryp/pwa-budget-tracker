let db;

const request = window.indexedDB.open("budgetDB", 1);

request.onsuccess = e => {
    db = e.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
}

request.onupgradeneeded = ({ target }) => {
    db = target.result;
    const budgetStore = db.createObjectStore("pending", {
        autoIncrement: true
    });
}

request.onerror = e => {
    console.log("Error: " + e.target.errorCode);
}

function saveRecord(record) {
    
    const transaction = db.transaction(["pending"], "readwrite");

    const store = transaction.objectStore("pending");

    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");

    const store = transaction.objectStore("pending");

    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(["pending"], "readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
            })
        }
    }
}