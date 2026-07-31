import { memo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useIsDeletingPortfolioItem, usePortfolioItem, usePortfolioStore } from '@/store/portfolio-store'

function PortfolioItemCard({ id }) {
  const item = usePortfolioItem(id)
  const isDeleting = useIsDeletingPortfolioItem(id)
  const deleteError = usePortfolioStore((state) => state.deleteError)
  const deleteItem = usePortfolioStore((state) => state.deleteItem)

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [failed, setFailed] = useState(false)

  if (!item) return null

  const handleDelete = async () => {
    setFailed(false)
    const success = await deleteItem(id)
    if (!success) setFailed(true)
    setIsConfirmingDelete(false)
  }

  return (
    <li className="portfolio-item">
      {item.imageUrl && (
        <img className="portfolio-item-image" src={item.imageUrl} alt="" loading="lazy" />
      )}
      <div className="portfolio-item-body">
        <div className="portfolio-item-heading">
          <h3>{item.title}</h3>
          {item.status && <span className="portfolio-item-status">{item.status}</span>}
        </div>
        <p className="portfolio-item-description">{item.description}</p>
        <p className="portfolio-item-technology">{item.technology}</p>
        <div className="portfolio-item-links">
          <a href={item.projectUrl} target="_blank" rel="noreferrer">
            View project
          </a>
          {item.githubUrl && (
            <a href={item.githubUrl} target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
        </div>

        {failed && deleteError && (
          <p className="portfolio-item-error" role="alert">
            {deleteError}
          </p>
        )}

        <div className="portfolio-item-actions">
          {isConfirmingDelete ? (
            <>
              <span className="portfolio-item-confirm-text">Delete this item?</span>
              <button
                type="button"
                className="portfolio-item-delete-confirm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Confirm'}
              </button>
              <button
                type="button"
                className="portfolio-item-cancel"
                onClick={() => setIsConfirmingDelete(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <Link to={`/portfolio/${item.id}/edit`} className="portfolio-item-edit">
                Edit
              </Link>
              <button
                type="button"
                className="portfolio-item-delete"
                onClick={() => setIsConfirmingDelete(true)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  )
}

export default memo(PortfolioItemCard)
