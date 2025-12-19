@component('mail::message')
@if ($recipientType === 'parent_author')
# New Reply to Your Comment

{{ $comment->user->name }} replied to your comment on **{{ $toolName }}**:
@else
# New Comment on Your Tool

{{ $comment->user->name }} left a comment on your tool **{{ $toolName }}**:
@endif

---

### Comment:
> {{ $comment->text }}

---

@component('mail::button', ['url' => $toolUrl, 'color' => 'primary'])
View on {{ $appName }}
@endcomponent

@if ($recipientType === 'parent_author')
Reply to this comment or view the full conversation on our platform.
@else
Engage with feedback on your tool to help the community!
@endif

---

{{ $appName }} Team
@endcomponent
