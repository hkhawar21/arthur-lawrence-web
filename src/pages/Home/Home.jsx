import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { useAuthStore } from '@/store/auth-store'
import { usePortfolioStore } from '@/store/portfolio-store'
import PortfolioItemCard from '@/components/PortfolioItemCard/PortfolioItemCard'
import './Home.css'

const PAGE_LIMIT = 10

export default function Home() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const ids = usePortfolioStore((state) => state.ids)
  const isLoading = usePortfolioStore((state) => state.isLoading)
  const isLoadingMore = usePortfolioStore((state) => state.isLoadingMore)
  const error = usePortfolioStore((state) => state.error)
  const page = usePortfolioStore((state) => state.page)
  const totalPages = usePortfolioStore((state) => state.totalPages)
  const fetchFirstPage = usePortfolioStore((state) => state.fetchFirstPage)
  const fetchNextPage = usePortfolioStore((state) => state.fetchNextPage)

  useEffect(() => {
    if (usePortfolioStore.getState().ids.length === 0) {
      fetchFirstPage(PAGE_LIMIT)
    }
  }, [fetchFirstPage])

  const hasMore = totalPages === null || page < totalPages

  return (
    <div className="home-page">
      <header className="home-header">
        <div>
          <h1>Welcome{user?.name ? `, ${user.name}` : ''}</h1>
          <p>{user?.email}</p>
        </div>
        <button type="button" onClick={logout}>
          Sign out
        </button>
      </header>

      <section className="portfolio-section">
        <div className="portfolio-section-header">
          <h2>Portfolio</h2>
          <Link to="/portfolio/new" className="portfolio-new-link">
            Add item
          </Link>
        </div>

        {isLoading && <p role="status">Loading portfolio…</p>}

        {!isLoading && error && ids.length === 0 && (
          <div className="portfolio-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => fetchFirstPage(PAGE_LIMIT)}>
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && ids.length === 0 && <p>No portfolio items yet.</p>}

        {!isLoading && ids.length > 0 && (
          <>
            <ul className="portfolio-list">
              {ids.map((id) => (
                <PortfolioItemCard key={id} id={id} />
              ))}
            </ul>

            {error && (
              <div className="portfolio-error" role="alert">
                <p>{error}</p>
                <button type="button" onClick={() => fetchNextPage(PAGE_LIMIT)}>
                  Retry
                </button>
              </div>
            )}

            {!error && hasMore && (
              <button
                type="button"
                className="portfolio-load-more"
                onClick={() => fetchNextPage(PAGE_LIMIT)}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? 'Loading…' : 'Load more'}
              </button>
            )}
          </>
        )}
      </section>
    </div>
  )
}
