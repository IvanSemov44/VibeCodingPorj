@component('mail::message')
# Your Activity Log Export is Ready! 📥

Hi {{ $user->name }},

Your activity log export has been successfully generated and is ready for download.

**Export Details:**
- **Filename:** {{ $filename }}
- **Generated:** {{ now()->format('Y-m-d H:i:s') }}
- **Expires:** {{ $expiresAt }}

@component('mail::button', ['url' => $downloadUrl])
Download Export (CSV)
@endcomponent

**Note:** This link will expire in 7 days. After that, you can generate a new export from the admin panel.

If you didn't request this export or have any questions, please contact our support team.

Thanks,
{{ config('app.name') }}
@endcomponent
