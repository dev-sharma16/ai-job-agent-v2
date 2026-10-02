# Browser Automation and Application Submission

## 1. Purpose

Use Playwright to automate repetitive application-form work after a user has reviewed the application package.

The browser automation layer must be deterministic wherever possible.

## 2. Safety boundary

The application may:

- open public application URLs
- inspect forms
- fill normal fields
- upload the selected resume
- fill verified answers
- pause for user input
- take screenshots
- submit after approval

The application must not:

- bypass CAPTCHA
- bypass MFA/OTP
- defeat bot detection
- bypass access controls
- steal or reuse credentials
- evade website security
- create fake identities
- falsify application information

If a challenge appears:

```text
BROWSER_CHALLENGE
      ↓
NEEDS_HUMAN
```

## 3. Browser profile

Use a persistent Playwright profile.

Example:

```text
.playwright/
  profiles/
    default/
```

Never commit it.

Add to `.gitignore`:

```text
.playwright/
*.storage.json
```

## 4. Provider abstraction

```ts
interface ApplicationProvider {
  canHandle(url: string): boolean;

  inspect(page: Page): Promise<ApplicationForm>;

  fill(page: Page, application: ApplicationPackage): Promise<FillResult>;

  submit(page: Page): Promise<SubmitResult>;
}
```

Implement providers independently.

Start with one ATS/provider.

Recommended first target:

```text
Greenhouse
```

Then add:

```text
Lever
Ashby
```

## 5. Form inspection

Collect:

```text
label
name
type
placeholder
required
options
nearby text
```

Do not rely exclusively on CSS selectors.

Prefer semantic locators:

```ts
page.getByLabel('Email');
page.getByRole('textbox', { name: 'Phone' });
```

Fallback selectors should be provider-specific and tested.

## 6. Field mapping

Create a normalized field type:

```text
NAME
EMAIL
PHONE
LOCATION
LINKEDIN
GITHUB
PORTFOLIO
RESUME
COVER_LETTER
WORK_AUTHORIZATION
NOTICE_PERIOD
SALARY
CUSTOM
```

Map known fields deterministically.

## 7. Custom questions

When a custom question appears:

```text
question
  ↓
question classifier
  ↓
verified source lookup
  ↓
answer
```

If no verified answer exists:

```text
NEEDS_HUMAN
```

Do not submit.

## 8. Resume upload

Upload exactly the resume version selected for this application.

Persist:

```text
resumeId
contentHash
```

in the application record.

## 9. Pre-submit validation

Before submit:

```text
required fields complete?
resume uploaded?
unresolved questions?
unsupported answers?
wrong resume?
wrong company/job?
```

If any critical check fails:

```text
NEEDS_HUMAN
```

## 10. Screenshot

Capture a screenshot before final submission.

Store metadata and the screenshot path securely.

Do not expose private browser state.

## 11. Approval flow

Default:

```text
READY_FOR_REVIEW
       ↓
USER APPROVES
       ↓
APPLICATION_STARTED
       ↓
FORM_FILLED
       ↓
PRE_SUBMIT_CHECK
       ↓
SUBMIT
       ↓
SUBMITTED
```

If user rejects:

```text
READY_FOR_REVIEW → REJECTED
```

## 12. Browser errors

Handle:

```text
PAGE_NOT_FOUND
FORM_CHANGED
UPLOAD_FAILED
TIMEOUT
LOGIN_REQUIRED
CAPTCHA
MFA_REQUIRED
UNKNOWN_FIELD
SUBMISSION_FAILED
```

Each should produce an explicit application event.

## 13. Idempotency

Never accidentally submit the same job twice.

Before application:

```text
query existing application by job_id
```

If already submitted:

```text
STOP
```

Allow the user to explicitly override only through the UI.

## 14. Browser testing

Use test pages/local fixtures to test:

- simple form
- select fields
- checkbox
- radio buttons
- file upload
- custom question
- missing field
- challenge page
- submission success

Do not run tests against real employers automatically.

## 15. Application provider roadmap

Phase 1:

```text
Greenhouse
```

Phase 2:

```text
Lever
```

Phase 3:

```text
Ashby
```

Each provider must have its own tests and adapter.

Do not create one giant fragile universal scraper.
