# Connecting Google Sheets to SETHI WOODs ART

Follow these steps to turn your Google Sheet into a database for your application.

## 1. Prepare your Google Sheet
1. Create a new Google Sheet.
2. Rename the tabs: `Products`, `Orders`, `Users`, `Queries`.
3. Headers:
   - `Products`: `id`, `name`, `description`, `price`, `image`, `category`, `stock`
   - `Orders`: `order_id`, `customer_name`, `phone`, `address`, `city`, `product_name`, `quantity`, `total`, `status`, `date`
   - `Users`: `id`, `name`, `email`, `role`, `joined`
   - `Queries`: `id`, `customer_name`, `phone`, `email`, `message`, `status`, `date`

## 2. Add the Google Apps Script

⚠️ **CRITICAL FOR DELETIONS TO WORK:** If you previously deployed V4 or V5, you **MUST** update to this script (V6) and click **Deploy -> Manage Deployments -> Edit (pencil icon) -> New Version -> Deploy**. Otherwise, deletions and multi-image fields may fail to save silently!

1. In your Google Sheet, go to **Extensions** > **Apps Script**.
2. Delete everything and paste this updated script:

```javascript
// SETHI WOODS ART - Full CRUD API v7 (Handles multiple sheets dynamically including emails)
function doGet(e) {
  const sheetName = e.parameter.sheet || 'Products';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return errorResponse("Sheet not found: " + sheetName);

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return jsonResponse([]); 
  
  const headers = data[0].map(h => String(h).trim());
  const rows = data.slice(1);
  
  const result = rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      if (header) obj[header] = row[i];
    });
    return obj;
  });
  
  return jsonResponse(result);
}

function doPost(e) {
  try {
    const contents = e.postData.contents;
    const params = JSON.parse(contents);
    const sheetName = params.sheet || 'Products';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return errorResponse("Sheet not found: " + sheetName);
    
    // We get current data just to know headers
    const data = sheet.getDataRange().getValues();
    const originalHeaders = data.length > 0 ? data[0] : [];
    const trimmedHeaders = originalHeaders.map(h => String(h).trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    // Normalize input params
    const normalizedParams = {};
    Object.keys(params).forEach(k => {
      const key = k.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      normalizedParams[key] = params[k];
    });

    // ID Match Logic
    let idToMatch = normalizedParams['id'] || normalizedParams['sku'] || normalizedParams['productid'] || normalizedParams['orderid'];
    
    let idColumnIndex = -1;
    const idAliases = ['id', 'sku', 'productid', 'orderid', 'itemid', 'code'];
    for (let alias of idAliases) {
      idColumnIndex = trimmedHeaders.indexOf(alias);
      if (idColumnIndex > -1) break;
    }
    if (idColumnIndex === -1) idColumnIndex = 0; // fallback to first col

    let rowIndex = -1;
    if (idToMatch != undefined) {
      const searchVal = String(idToMatch).trim();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][idColumnIndex]).trim() === searchVal) {
          rowIndex = i + 1;
          break;
        }
      }
    }

    // Deletion
    if (params.action === 'delete') {
      if (rowIndex > -1) {
        sheet.deleteRow(rowIndex);
        return jsonResponse({ status: 'success', action: 'delete', id: idToMatch });
      }
      return jsonResponse({ status: 'success', action: 'delete_not_found', id: idToMatch }); // silent success
    }

    // Mapping new row based on headers
    const newRow = originalHeaders.map((h, i) => {
      const headerKey = trimmedHeaders[i];
      if (headerKey === '') return '';
      
      // If we directly sent this key
      if (normalizedParams[headerKey] !== undefined) return normalizedParams[headerKey];
      
      // Fallback mapping
      const p = normalizedParams;
      if (['id', 'sku', 'productid', 'orderid'].indexOf(headerKey) > -1) return idToMatch || '';
      if (['name', 'productname', 'title', 'customername', 'cutomername'].indexOf(headerKey) > -1) return p.name || p.customername || p.cutomername || '';
      if (['price', 'rate', 'cost'].indexOf(headerKey) > -1) return p.price || 0;
      if (['description', 'desc', 'details', 'message'].indexOf(headerKey) > -1) return p.description || p.message || '';
      if (['image', 'img', 'url'].indexOf(headerKey) > -1) return p.image || '';
      if (['category', 'type'].indexOf(headerKey) > -1) return p.category || '';
      if (['stock', 'qty', 'quantity'].indexOf(headerKey) > -1) return p.stock || 0;
      if (['phone', 'contact'].indexOf(headerKey) > -1) return p.phone || '';
      if (['email', 'mail'].indexOf(headerKey) > -1) return p.email || '';
      if (['status', 'state'].indexOf(headerKey) > -1) return p.status || '';
      if (['date', 'createdat', 'time'].indexOf(headerKey) > -1) return p.date || new Date().toISOString();
      
      return '';
    });
    
    // Update or Append
    if (rowIndex > -1) {
      sheet.getRange(rowIndex, 1, 1, originalHeaders.length).setValues([newRow]);
      return jsonResponse({ status: 'success', action: 'update' });
    } else {
      sheet.appendRow(newRow);
      return jsonResponse({ status: 'success', action: 'append' });
    }
  } catch (err) {
    return errorResponse(err.toString());
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
  return jsonResponse({ status: 'error', message: msg });
}
```

## 3. Deploy and Connect
1. Click **Deploy** > **New deployment**.
2. Select **Web app**.
3. **Execute as**: Me. **Who has access**: Anyone.
4. Click **Deploy**.
5. **IMPORTANT:** After clicking Deploy, you will get a **Web app URL**. It MUST end in `/exec`. 
   - **Incorrect:** `.../library/...`
   - **Correct:** `https://script.google.com/macros/s/ABC...XYZ/exec`
6. Go to AI Studio **Settings**, add `VITE_GOOGLE_SHEETS_URL` and paste your `/exec` URL.
