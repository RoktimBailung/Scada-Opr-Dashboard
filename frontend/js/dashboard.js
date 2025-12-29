// DRILLING RTDMM FORM HANDLING

document.getElementById("drillingForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const drillingRecord = {
        date: this.querySelectorAll('input[type="date"]')[0].value,
        rigName: this.querySelectorAll('input[type="text"]')[0].value,
        location: this.querySelectorAll('input[type="text"]')[1].value,
        availability: this.querySelector('select').value,
        remark: this.querySelector('textarea').value,
        installDate: this.querySelectorAll('input[type="date"]')[1].value,
        deinstallDate: this.querySelectorAll('input[type="date"]')[2].value
    };

//  DEBUG LOG 
    console.log("Sending DRILLING data to backend:", drillingRecord);

    fetch("http://localhost:3000/api/drilling", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(drillingRecord)
    })
        .then(response => response.json())
        .then(data => {
            console.log("Backend response:", data);
            alert("Drilling RTDMM data sent to backend successfully");
            this.reset();
        })
        .catch(error => {
            console.error("Error sending drilling data:", error);
            alert("ERROR: Drilling data not sent. Check console.");
        });
});



// PRODUCTION SCADA FORM HANDLING

document.getElementById("productionForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const productionRecord = {
        production: this.querySelectorAll('input[type="text"]')[0].value,
        location: this.querySelectorAll('input[type="text"]')[1].value,
        availability: this.querySelector('select').value,
        remark: this.querySelector('textarea').value
    };

//DEBUG LOG
    console.log("Sending PRODUCTION data to backend:", productionRecord);

    fetch("http://localhost:3000/api/production", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(productionRecord)
    })
        .then(response => response.json())
        .then(data => {
            console.log("Backend response:", data);
            alert("Production SCADA data sent to backend successfully");
            this.reset();
        })
        .catch(error => {
            console.error("Error sending production data:", error);
            alert("ERROR: Production data not sent. Check console.");
        });
});


// LOGOUT

function logout() {
    window.location.href = "index.html";
}

// VIEW 

function viewExcel() {
    const link = document.createElement("a");
    link.href = "http://localhost:3000/api/export-excel";
    link.download = "SCADA_OPR.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
