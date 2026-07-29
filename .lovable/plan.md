# TaskBoost — Build Plan

A modern, mobile-first social media earning platform in Trustworthy Fintech blue & white, powered by Lovable Cloud.

## Stack & setup
- Enable Lovable Cloud (Postgres + Auth + RLS).
- Design system: blue #2563eb primary, white/slate surfaces, rounded cards, subtle elevation, Inter/Space Grotesk typography.
- Currency: NGN (₦) with configurable per-task reward; balance shown in ₦.
- Auth: email/password + Google.

## Database (Cloud)
- `profiles` (id → auth.users, full_name, username, phone, avatar_url, referred_by, created_at)
- `user_roles` (user_id, role: admin|user) + `has_role()` security-definer
- `tasks` (id, platform: facebook|instagram|tiktok|youtube|x, type: like|follow|subscribe, title, description, target_url, reward_naira, slots_total, slots_filled, active)
- `submissions` (id, task_id, user_id, proof_url, screenshot_url, status: pending|approved|rejected, admin_note, created_at)
- `earnings_ledger` (id, user_id, amount_naira, source: task|referral|withdrawal, ref_id, created_at) → balance = SUM
- `referrals` (referrer_id, referee_id, bonus_paid, created_at); flat bonus (admin-configurable setting)
- `withdrawals` (id, user_id, amount_naira, method: bank|opay|palmpay, account_name, account_number, bank_name, status: pending|approved|rejected|paid, admin_note)
- `notifications` (id, user_id, title, body, read, created_at)
- `settings` (key/value: signup_bonus, referral_bonus, min_withdrawal)
- RLS: users see own rows; admins full access via `has_role`.

## Routes
Public
- `/` Landing (hero, how it works, platforms, earnings example, testimonials, CTA)
- `/auth` Login + Signup (with `?ref=CODE` capture)

Authenticated (`_authenticated/`)
- `/dashboard` Balance card, quick stats, recent activity, notifications bell
- `/tasks` Filter by platform, task cards, "Start task" → open target URL + submission form (screenshot upload + proof link)
- `/earnings` Balance, ledger table, pending vs approved
- `/referrals` Referral link, code, count, bonuses earned, share buttons (WhatsApp/X/copy)
- `/withdraw` Balance, method form (Nigerian banks/OPay/PalmPay), history
- `/settings` Profile edit, change password, notifications preferences

Admin (`_authenticated/admin/`)
- `/admin` Overview KPIs
- `/admin/tasks` Create/edit/delete tasks
- `/admin/submissions` Approve/reject with credit to ledger
- `/admin/users` List, promote/demote, view balances
- `/admin/withdrawals` Approve/reject/mark paid (debits ledger on approval)

## Key flows
- Signup with `?ref=` → creates profile, links referrer, credits flat signup bonus to referrer once (trigger).
- Task completion: user opens target, submits proof → admin approves → trigger inserts +reward into `earnings_ledger` and notification.
- Withdrawal request: validates min threshold and available balance (approved earnings minus pending/approved withdrawals) → admin approves → ledger debit + notification.

## Server functions
- `submitTaskProof`, `requestWithdrawal`, `adminApproveSubmission`, `adminRejectSubmission`, `adminApproveWithdrawal`, `adminUpdateWithdrawalStatus`, `getBalance`, `getLedger`, `getReferralStats`.
- Storage bucket `proofs` for screenshots (RLS: owner upload, admin read).

## UI notes
- Mobile-first: bottom nav on `_authenticated` (Dashboard, Tasks, Earnings, Referrals, Profile).
- Notifications: bell in top bar, dropdown list, unread badge.
- Platform icons with brand colors on task cards; reward pill in ₦.
- Empty states, skeleton loaders, toast feedback.

## Out of scope (v1)
- Automated payout gateway integration (admins mark paid manually).
- Verifying real Facebook/IG/TikTok actions programmatically (relies on screenshot proof).

Confirm to proceed and I'll build it end-to-end.