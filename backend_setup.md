# 🚀 Free Backend Setup Guide for Apex Football Academy

This website contains a built-in free backend connection to **Google Sheets** and **Google Drive**. Whenever a user registers for a **Trial Session** or places a **Gear Store Order**, the details are automatically saved as new rows in your Google Sheet and you receive an email notification. 

If a store customer pays via UPI and uploads a payment screenshot, the backend automatically saves the image to a folder in your **Google Drive** and saves the download link directly in the Google Sheet.

Follow this simple, step-by-step guide to activate your free backend:

---

## Step 1: Create a Google Sheet
1. Open your browser and go to [Google Sheets](https://sheets.google.com).
2. Create a new **Blank Spreadsheet**.
3. Name it something descriptive, like **Apex Football Academy Registrations & Orders**.

---

## Step 2: Open Google Apps Script Editor
1. In the top menu of your Google Sheet, click on **Extensions** -> **Apps Script**.
2. This will open a code editor tab in your browser. Delete any default code inside the editor (like `function myFunction() {}`).

---

## Step 3: Paste the Backend Code
Copy the entire code block below and paste it into the Apps Script editor:

```javascript
/**
 * Apex Football Academy Backend Controller
 * Handles trial session bookings and store orders.
 * Saves data to Google Sheets & files (screenshots) to Google Drive.
 */

function doPost(e) {
  try {
    // Parse the incoming JSON payload
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // ----------------------------------------------------
    // CASE A: TRIAL BOOKING SUBMISSION
    // ----------------------------------------------------
    if (data.type === 'booking') {
      var sheet = ss.getSheetByName("Bookings");
      if (!sheet) {
        sheet = ss.insertSheet("Bookings");
        // Set headers for a new sheet
        sheet.appendRow(["Timestamp", "Player Name", "Player Age", "Academy Program", "Parent Name", "Phone Number", "Email Address", "Preferred Date"]);
        // Style headers (bold & dark background)
        sheet.getRange("A1:H1").setFontWeight("bold").setBackground("#10b981").setFontColor("#ffffff");
        sheet.setFrozenRows(1);
      }
      
      // Append details
      sheet.appendRow([
        new Date(),
        data.playerName,
        data.playerAge,
        data.program,
        data.parentName,
        data.phone,
        data.email,
        data.preferredDate
      ]);
      
      // Send email notification to owner
      sendEmailNotification("⚽ New Trial Session Booking - " + data.playerName, data);
      
    // ----------------------------------------------------
    // CASE B: STORE ORDER SUBMISSION
    // ----------------------------------------------------
    } else if (data.type === 'order') {
      var sheet = ss.getSheetByName("Orders");
      if (!sheet) {
        sheet = ss.insertSheet("Orders");
        // Set headers for a new sheet
        sheet.appendRow(["Timestamp", "Order Reference", "Customer Name", "Email Address", "Phone Number", "Street Address", "City", "State", "ZIP Code", "Items Ordered", "Total Amount", "Payment Method", "Screenshot URL"]);
        // Style headers
        sheet.getRange("A1:M1").setFontWeight("bold").setBackground("#3b82f6").setFontColor("#ffffff");
        sheet.setFrozenRows(1);
      }
      
      // Handle screenshot file saving to Google Drive if UPI payment method
      var screenshotUrl = "N/A";
      if (data.screenshot) {
        try {
          // Find or create a folder named "Apex Orders Screenshots" in your Drive
          var folders = DriveApp.getFoldersByName("Apex Orders Screenshots");
          var folder;
          if (folders.hasNext()) {
            folder = folders.next();
          } else {
            folder = DriveApp.createFolder("Apex Orders Screenshots");
          }
          
          var contentType = "image/png";
          var matches = data.screenshot.match(/^data:(.*?);base64,/);
          if (matches) {
            contentType = matches[1];
          }
          
          // Decode base64 image data
          var base64Data = data.screenshot.replace(/^data:.*?;base64,/, "");
          var decoded = Utilities.base64Decode(base64Data);
          var blob = Utilities.newBlob(decoded, contentType, "Screenshot_" + data.orderNum + ".png");
          
          // Save file and set public link sharing
          var file = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          screenshotUrl = file.getUrl();
        } catch (err) {
          screenshotUrl = "Error saving image: " + err.toString();
        }
      }
      
      // Format items as a clean list in a single sheet cell
      var itemsText = data.items.map(function(item) {
        var sizeText = item.size ? " (" + item.size + ")" : "";
        return item.quantity + "x " + item.name + sizeText + " [₹" + item.price + "]";
      }).join(", ");
      
      sheet.appendRow([
        new Date(),
        data.orderNum,
        data.name,
        data.email,
        data.phone,
        data.address,
        data.city,
        data.state,
        data.zip,
        itemsText,
        data.total,
        data.paymentMethod,
        screenshotUrl
      ]);
      
      // Send email notification to owner
      sendEmailNotification("🛍️ New Store Order - " + data.orderNum, data, itemsText, screenshotUrl);
    }
    
    // Return success response to the website frontend
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Sends an email notification to the spreadsheet owner.
 */
function sendEmailNotification(subject, data, itemsText, screenshotUrl) {
  var email = Session.getActiveUser().getEmail(); // Automatically retrieves your Gmail address
  var body = "";
  
  if (data.type === 'booking') {
    body = "Hello Coach,\n\n" +
           "A new player evaluation trial session has been booked on the website.\n\n" +
           "🔹 Player Name: " + data.playerName + "\n" +
           "🔹 Player Age: " + data.playerAge + "\n" +
           "🔹 Academy Program: " + data.program + "\n" +
           "🔹 Parent/Guardian Name: " + data.parentName + "\n" +
           "🔹 Phone Number: " + data.phone + "\n" +
           "🔹 Email: " + data.email + "\n" +
           "🔹 Preferred Trial Date: " + data.preferredDate + "\n\n" +
           "Open your Google Sheet to view all bookings.";
  } else {
    body = "Hello Admin,\n\n" +
           "A new merchandise order has been placed on the website.\n\n" +
           "🔹 Order Reference: " + data.orderNum + "\n" +
           "🔹 Customer Name: " + data.name + "\n" +
           "🔹 Email Address: " + data.email + "\n" +
           "🔹 Phone Number: " + data.phone + "\n" +
           "🔹 Shipping Address: " + data.address + ", " + data.city + ", " + data.state + " - " + data.zip + "\n" +
           "🔹 Items Ordered: " + itemsText + "\n" +
           "🔹 Total Paid/Due: ₹" + data.total.toLocaleString('en-IN') + "\n" +
           "🔹 Payment Method: " + data.paymentMethod + "\n";
           
    if (screenshotUrl && screenshotUrl !== "N/A") {
      body += "📸 Payment Screenshot URL: " + screenshotUrl + "\n";
    }
    
    body += "\nOpen your Google Sheet to manage all orders and checkouts.";
  }
  
  try {
    MailApp.sendEmail(email, subject, body);
  } catch (e) {
    Logger.log("Failed to send email: " + e.toString());
  }
}
```

---

## Step 4: Save & Deploy the Web App
1. In the Apps Script menu bar, click the **Save** icon (floppy disk).
2. Click the blue **Deploy** button at the top-right, and select **New deployment**.
3. Under *Select type* (gear icon), click **Web app**.
4. Configure the settings:
   * **Description**: `Apex Website Backend`
   * **Execute as**: `Me (your email address)`
   * **Who has access**: **`Anyone`** (This is crucial, so that the website frontend can submit data anonymously).
5. Click **Deploy**.
6. Google will ask you to authorize access to your Google Sheet and Google Drive:
   * Click **Authorize access**.
   * Choose your Google Account.
   * Google might show an "unverified app" warnings page. Click on **Advanced** (at the bottom) and then click **Go to Untitled project (unsafe)**.
   * Click **Allow**.
7. Once successfully deployed, copy the **Web app URL** provided in the modal (it ends with `/exec`).

---

## Step 5: Update the Website Code
1. Open [app.js](file:///c:/Users/samee/Desktop/Kuldeep%20-%20Website/app.js).
2. Near the top of the file (around line 9), locate:
   ```javascript
   const BACKEND_URL = '';
   ```
3. Paste your copied Web App URL between the single quotes:
   ```javascript
   const BACKEND_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
4. Save the file.
5. Push the changes to GitHub by running:
   ```bash
   git add app.js
   git commit -m "feat: configure live google sheets backend URL"
   git push origin main
   ```

---

## 🎉 How to Manage Your Submissions
* Open your **Google Sheet** to see two automated tabs: **Bookings** and **Orders**.
* You can add custom columns (like "Status: Contacted", "Order Shipped", "Evaluated") next to the populated data to manage lead progression.
* Every time a form is submitted, check your **Gmail** inbox for instantaneous notification emails containing the full registration context.
