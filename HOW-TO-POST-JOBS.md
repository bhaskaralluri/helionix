# How to post, edit and remove jobs

Open roles live in **one file: `jobs.json`**. The Careers page (`careers.html`) reads it automatically.
You never need to touch the HTML.

## Edit from the GitHub website (no tools needed)

1. Go to your repo on github.com and click **`jobs.json`**.
2. Click the **pencil icon** (Edit this file).
3. Add, change or remove a job (template below). Keep the commas and quotes exactly as shown.
4. Click **Commit changes**.
5. Netlify redeploys automatically. The change is live at helionixai.com/careers.html in about a minute.

Tip: paste your edited text into https://jsonlint.com first if you are unsure. A missing comma is the most common mistake.
If the file is invalid, the page simply shows "No open roles", so check it after every edit.

## Job template

Copy this block into the `"jobs"` list. Separate multiple jobs with a comma.

```json
{
  "jobs": [
    {
      "id": "ai-agent-engineer",
      "title": "AI Agent Engineer",
      "department": "Engineering",
      "location": "Remote (US)",
      "type": "Full-time",
      "posted": "2026-11-14",
      "expires": "2027-01-31",
      "status": "open",
      "salary": "Competitive, based on experience",
      "summary": "One or two sentences about the role.",
      "responsibilities": [
        "Design and build production AI agents for enterprise clients",
        "Own evaluation and observability for what you ship"
      ],
      "requirements": [
        "3+ years of software engineering experience",
        "Hands-on experience with LLM APIs, tool use and RAG"
      ],
      "niceToHave": [
        "Experience with MCP servers",
        "Security mindset for AI systems"
      ]
    }
  ]
}
```

## Field guide

| Field | Required | Notes |
|---|---|---|
| `id` | recommended | Short, lowercase, unique, no spaces. It becomes the link: `careers.html#ai-agent-engineer`. |
| `title` | **yes** | The job title shown on the card. |
| `department` | no | Used for the "All teams" filter. |
| `location` | no | Include the word "Remote" for remote roles (also marks it as remote for Google). |
| `type` | no | e.g. Full-time, Part-time, Contract, Internship. |
| `posted` | no | `YYYY-MM-DD`. |
| `expires` | no | `YYYY-MM-DD`. After this date the job hides itself automatically. |
| `status` | no | `"open"` (default) or `"closed"`. Set to `"closed"` to hide a job without deleting it. |
| `salary` | no | Free text. Some regions require salary ranges to be posted. |
| `summary`, `responsibilities`, `requirements`, `niceToHave` | no | Shown when the card is expanded. Empty sections are skipped. |

## Common tasks

- **Take a job down:** set `"status": "closed"` (or delete its block).
- **No jobs open:** leave `"jobs": []`. The page then shows "No open roles right now" with a general-application form.
- **Applications:** they arrive by email through the same Web3Forms key as the contact form (see `assets/main.js`).
  Until the key is set, the Apply button opens the applicant's email app addressed to hello@helionixai.com.

## Optional upgrade

If you would like a point-and-click form instead of editing JSON, a CMS such as Decap CMS can be added so you can post jobs from a friendly admin page.
