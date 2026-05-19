import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212]">
      <div className="mb-8 flex flex-col items-center gap-0">
        <svg viewBox="0 0 168 168" className="w-12 h-12 fill-[#1ed760]" xmlns="http://www.w3.org/2000/svg">
          <path d="M84 0C37.6 0 0 37.6 0 84s37.6 84 84 84 84-37.6 84-84S130.4 0 84 0zm38.5 121.2c-1.5 2.5-4.8 3.3-7.3 1.8C97.8 112.4 79 108 56.8 108.4c-2.9.1-5.3-2.2-5.4-5.1-.1-2.9 2.2-5.3 5.1-5.4 24.4-.5 45.4 4.6 63.7 16.1 2.5 1.5 3.3 4.7 1.8 7.2zm10.3-22.8c-1.9 3.1-6 4.1-9.1 2.2-15.4-9.5-38.9-12.2-57.1-6.7-3.3 1-6.8-.9-7.8-4.2-1-3.3.9-6.8 4.2-7.8 20.8-6.3 46.8-3.2 64.6 7.6 3.1 1.9 4.1 6 2.2 8.9zm.9-23.7C116.3 62.8 84.8 61.6 64 68c-4 1.2-8.2-1.1-9.4-5.1-1.2-4 1.1-8.2 5.1-9.4C82.1 47 117 48.4 141.3 60.6c3.6 1.8 5.1 6.2 3.2 9.8-1.8 3.6-6.2 5.1-9.8 3.3h.1z"/>
        </svg>
      </div>
      <RegisterForm />
    </div>
  )
}
