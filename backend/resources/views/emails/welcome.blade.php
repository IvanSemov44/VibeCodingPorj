@component('mail::message')
# Welcome to {{ $appName }}

Hi {{ $user->name }},

We're thrilled to have you join our vibrant community of developers and tool enthusiasts!

## Getting Started

Your account is now ready to explore:
- **Discover Tools** - Browse curated tools and frameworks
- **Share Feedback** - Rate and review tools you use
- **Connect** - Engage with the developer community
- **Track Progress** - Keep a journal of your learning journey

## Explore Now

@component('mail::button', ['url' => $appUrl, 'color' => 'primary'])
Get Started
@endcomponent

## Need Help?

If you have any questions or need assistance, feel free to reach out to our support team.

---

Happy exploring!

{{ $appName }} Team
@endcomponent
