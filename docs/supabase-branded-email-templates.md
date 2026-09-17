# Supabase Branded Email Templates — Relaxed Menu

Use these in Supabase Dashboard → Authentication → Email Templates.

Brand colors:

- Orange: `#E84B1A`
- Dark text: `#241B16`
- Background: `#F5F0E8`

## Confirm signup

Subject:

```txt
Verify your Relaxed Menu email
```

Body:

```html
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Verify your Relaxed Menu email</title>
  </head>
  <body style="margin:0;padding:0;background:#F5F0E8;font-family:Inter,Arial,sans-serif;color:#241B16;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5F0E8;margin:0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fffaf4;border:1px solid #eadfd2;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(36,27,22,0.08);">
            <tr>
              <td style="padding:32px 32px 20px;text-align:center;">
                <div style="display:inline-block;width:56px;height:56px;border-radius:16px;background:#E84B1A;color:#ffffff;font-size:26px;font-weight:900;line-height:56px;text-align:center;letter-spacing:-2px;">RM</div>
                <h1 style="margin:18px 0 6px;font-size:28px;line-height:1.2;font-weight:900;color:#241B16;">Relaxed <span style="color:#E84B1A;">Menu</span></h1>
                <p style="margin:0;color:#7b6758;font-size:14px;line-height:1.6;">QR menu, ordering, and reviews for food businesses.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 32px;">
                <h2 style="margin:0 0 12px;font-size:22px;line-height:1.35;color:#241B16;">Verify your email address</h2>
                <p style="margin:0 0 18px;color:#5f5148;font-size:15px;line-height:1.7;">
                  Thanks for creating your Relaxed Menu account. Confirm this email address to finish setting up your restaurant or food business dashboard.
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:26px 0;">
                  <tr>
                    <td bgcolor="#E84B1A" style="border-radius:14px;">
                      <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-weight:800;font-size:15px;border-radius:14px;">Verify email</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 12px;color:#7b6758;font-size:13px;line-height:1.6;">
                  If the button does not work, copy and paste this link into your browser:
                </p>
                <p style="margin:0;padding:12px 14px;background:#fff3ea;border:1px solid #f5d4c4;border-radius:12px;word-break:break-all;font-size:12px;line-height:1.6;color:#8a3a1f;">
                  {{ .ConfirmationURL }}
                </p>
                <p style="margin:22px 0 0;color:#9b8a7c;font-size:12px;line-height:1.6;">
                  If you did not request this account, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;color:#9b8a7c;font-size:12px;">© Relaxed Menu · relaxedmenu.beyounded.com</p>
        </td>
      </tr>
    </table>
  </body>
</html>
```

## Reset password

Subject:

```txt
Reset your Relaxed Menu password
```

Body:

```html
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reset your Relaxed Menu password</title>
  </head>
  <body style="margin:0;padding:0;background:#F5F0E8;font-family:Inter,Arial,sans-serif;color:#241B16;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5F0E8;margin:0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fffaf4;border:1px solid #eadfd2;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(36,27,22,0.08);">
            <tr>
              <td style="padding:32px 32px 20px;text-align:center;">
                <div style="display:inline-block;width:56px;height:56px;border-radius:16px;background:#E84B1A;color:#ffffff;font-size:26px;font-weight:900;line-height:56px;text-align:center;letter-spacing:-2px;">RM</div>
                <h1 style="margin:18px 0 6px;font-size:28px;line-height:1.2;font-weight:900;color:#241B16;">Relaxed <span style="color:#E84B1A;">Menu</span></h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 32px;">
                <h2 style="margin:0 0 12px;font-size:22px;line-height:1.35;color:#241B16;">Reset your password</h2>
                <p style="margin:0 0 18px;color:#5f5148;font-size:15px;line-height:1.7;">Click below to choose a new password for your Relaxed Menu account.</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:26px 0;">
                  <tr>
                    <td bgcolor="#E84B1A" style="border-radius:14px;">
                      <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-weight:800;font-size:15px;border-radius:14px;">Reset password</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;padding:12px 14px;background:#fff3ea;border:1px solid #f5d4c4;border-radius:12px;word-break:break-all;font-size:12px;line-height:1.6;color:#8a3a1f;">{{ .ConfirmationURL }}</p>
                <p style="margin:22px 0 0;color:#9b8a7c;font-size:12px;line-height:1.6;">If you did not request a password reset, ignore this email.</p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;color:#9b8a7c;font-size:12px;">© Relaxed Menu · relaxedmenu.beyounded.com</p>
        </td>
      </tr>
    </table>
  </body>
</html>
```
