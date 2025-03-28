# SpawnSmart - Integration Guide

## Overview
This README provides step-by-step instructions for integrating and using the SpawnSmart data ingestion and metrics tracking platform via HTTP.

## Contact
For help with integration, please reach out at [hello@betterstack.com](mailto:hello@betterstack.com).

## Basic Information
- **Name:** SpawnSmart
- **Platform:** HTTP
- **Source ID:** spawnsmart
- **Source Token:** `fMmpKP5DibaBBTGUpc1EdvPD`
- **Ingesting Host:** `s1254691.eu-nbg-2.betterstackdata.com`

## Data Retention
- **Logs (Billable):** 3 days
- **Metrics (Billable):** 30 days

For custom options, please contact [hello@betterstack.com](mailto:hello@betterstack.com).

---

## Installation Instructions
**Estimated time required:** 5 minutes.

### 1. Initialize a new POST HTTP Request
- Choose your preferred programming language.
- Serialize a single log object or an array of logs into JSON or MessagePack for the request body.

### 2. Set Headers
- `Content-Type`: `application/json` or `application/msgpack`
- `Authorization`: `Bearer fMmpKP5DibaBBTGUpc1EdvPD`

### 3. Send the Request
- **URL:** `https://s1254691.eu-nbg-2.betterstackdata.com/`
- Wait for a `202` response to confirm successful ingestion.

---

## Data Collection
SpawnSmart collects two kinds of data from your applications:
- **Logs:** Textual records about events happening at a point in time.
  - Example: `User elon@confinity.com logged in from the IP address 1.1.1.1`
- **Metrics:** Numbers tracked over time.
  - Example: `CPU % used by the server.`

---

## Verification
### Logs
Run the following command in your terminal to send a log:
```bash
curl -X POST \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer fMmpKP5DibaBBTGUpc1EdvPD' \
-d '{"dt":"'"$(date -u +'%Y-%m-%d %T UTC')"'","message":"Hello from Better Stack!"}' \
-k \
https://s1254691.eu-nbg-2.betterstackdata.com
```

### Metrics
Run the following command in your terminal to send a metric:
```bash
curl -X POST \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer fMmpKP5DibaBBTGUpc1EdvPD' \
-d '{"dt":"'"$(date -u +'%Y-%m-%d %T UTC')"'","name":"logtail_test_metric","gauge":{"value":123}}' \
-k \
https://s1254691.eu-nbg-2.betterstackdata.com/metrics
```

---

## Need Help?
If you encounter any issues, feel free to chat with an expert at [hello@betterstack.com](mailto:hello@betterstack.com).

