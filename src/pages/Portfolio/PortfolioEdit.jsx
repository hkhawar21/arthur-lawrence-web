import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PortfolioForm from "@/components/PortfolioForm/PortfolioForm";
import { useGetPortfolioItem } from "@/hooks/use-portfolio";
import { usePortfolioStore } from "@/store/portfolio-store";
import { toPortfolioFormValues, toPortfolioItemInput } from "@/types/portfolio";
import "./PortfolioFormPage.css";

export default function PortfolioEdit() {
  const { id } = useParams();
  const itemId = Number(id);
  const navigate = useNavigate();

  const {
    data: fetchedItem,
    isLoading: isFetching,
    error: fetchError,
  } = useGetPortfolioItem(itemId);
  const item = fetchedItem;

  const updateItem = usePortfolioStore((state) => state.updateItem);
  const updateError = usePortfolioStore((state) => state.updateError);

  const initialValues = useMemo(() => toPortfolioFormValues(item), [item]);

  const handleSubmit = async (values, { setSubmitting }) => {
    const result = await updateItem(itemId, toPortfolioItemInput(values));
    setSubmitting(false);
    if (result) navigate("/", { replace: true });
  };

  return (
    <div className="portfolio-form-page">
      <div className="portfolio-form-card">
        <h1>Edit portfolio item</h1>

        {!item && isFetching && <p role="status">Loading…</p>}
        {!item && !isFetching && fetchError && <p role="alert">{fetchError}</p>}

        {item && (
          <PortfolioForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
            error={updateError}
            onCancel={() => navigate("/")}
          />
        )}
      </div>
    </div>
  );
}
