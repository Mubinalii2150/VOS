# API
All endpoints are JSON except upload multipart data and generated PNG artifacts. Upload first, then pass the returned `file_id` to `/api/analyze`. `/api/results/<file_id>` returns the complete analysis object consumed by the React dashboard.
