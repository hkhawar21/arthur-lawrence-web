import { useNavigate } from 'react-router-dom'

import { usePortfolioStore } from '@/store/portfolio-store'
import PortfolioForm from '@/components/PortfolioForm/PortfolioForm'
import { portfolioFormInitialValues, toPortfolioItemInput } from '@/types/portfolio'
import './PortfolioFormPage.css'

export default function PortfolioNew() {
  const navigate = useNavigate()
  const createItem = usePortfolioStore((state) => state.createItem)
  const createError = usePortfolioStore((state) => state.createError)

  const handleSubmit = async (values, { setSubmitting }) => {
    const item = await createItem(toPortfolioItemInput(values))
    setSubmitting(false)
    if (item) navigate('/', { replace: true })
  }

  return (
    <div className="portfolio-form-page">
      <div className="portfolio-form-card">
        <h1>New portfolio item</h1>
        <PortfolioForm
          initialValues={portfolioFormInitialValues}
          onSubmit={handleSubmit}
          submitLabel="Create item"
          error={createError}
          onCancel={() => navigate('/')}
        />
      </div>
    </div>
  )
}
