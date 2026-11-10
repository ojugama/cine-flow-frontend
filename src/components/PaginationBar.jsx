import { Pagination } from "react-bootstrap";

export default function PaginationBar({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
  itemLabel,
}) {
  const from = totalElements === 0 ? 0 : page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);
  const summary = `Mostrando ${from}–${to} de ${totalElements} ${itemLabel}`;

  if (!totalPages || totalPages <= 1) {
    return (
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
        <small className="text-muted">{summary}</small>
      </div>
    );
  }

  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  const end = Math.min(totalPages, start + 5);

  const numbers = [];
  for (let current = start; current < end; current += 1) {
    numbers.push(current);
  }

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
      <small className="text-muted">{summary}</small>
      <Pagination
        size="sm"
        className="mb-0"
        aria-label={`Paginación de ${itemLabel}`}
      >
        <Pagination.Prev
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        />
        {numbers.map((number) => (
          <Pagination.Item
            key={number}
            active={number === page}
            onClick={() => onPageChange(number)}
          >
            {number + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
        />
      </Pagination>
    </div>
  );
}
