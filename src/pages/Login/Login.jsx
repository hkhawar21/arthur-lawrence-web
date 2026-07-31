import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

import { useAuthStore } from '@/store/auth-store'
import './Login.css'

const initialValues = { email: '', password: '' }

const loginSchema = Yup.object({
  email: Yup.string().trim().required('Email is required').email('Enter a valid email address'),
  password: Yup.string().required('Password is required'),
})

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const status = useAuthStore((state) => state.status)
  const error = useAuthStore((state) => state.error)

  useEffect(() => {
    if (status === 'signedIn') navigate('/', { replace: true })
  }, [status, navigate])

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await login(values.email.trim(), values.password)
      navigate('/', { replace: true })
    } catch {
      // surfaced via the auth store's `error` state below
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Sign in</h1>
        <p className="login-subtitle">Enter your credentials to access your account.</p>

        <Formik initialValues={initialValues} validationSchema={loginSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form className="login-form" noValidate>
              <div className="login-field">
                <label htmlFor="email">Email</label>
                <Field id="email" name="email" type="email" autoComplete="email" />
                <ErrorMessage name="email" component="span" className="login-field-error" />
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>
                <Field id="password" name="password" type="password" autoComplete="current-password" />
                <ErrorMessage name="password" component="span" className="login-field-error" />
              </div>

              {error && <p className="login-form-error">{error}</p>}

              <button type="submit" className="login-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
