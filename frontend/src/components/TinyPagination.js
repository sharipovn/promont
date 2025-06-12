// TinyPagination.jsx
import React from "react";
import { Pagination } from "react-bootstrap";
import './TinyPagination.css';
import { useI18n } from '../context/I18nProvider';


export default function TinyPagination({ currentPage, totalPages, onPageChange }) {
  const { returnTitle } = useI18n();

  const handleNavigate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      onPageChange(pageNumber);
    }
  };

  const renderPaginationItems = () => {
    const items = [];

    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 1}
        onClick={() => handleNavigate(currentPage - 1)}
        className="tiny-pagination-btn"
      >
        ‹
      </Pagination.Prev>
    );

    for (let num = 1; num <= totalPages; num++) {
      if (
        num <= 2 ||
        num > totalPages - 2 ||
        Math.abs(num - currentPage) <= 1
      ) {
        items.push(
          <Pagination.Item
            key={num}
            active={num === currentPage}
            onClick={() => handleNavigate(num)}
            className={`tiny-pagination-btn ${num === currentPage ? 'active' : ''}`}
          >
            {num}
          </Pagination.Item>
        );
      } else if (
        num === 3 && currentPage > 5 ||
        num === totalPages - 2 && currentPage < totalPages - 3
      ) {
        items.push(<Pagination.Ellipsis key={`ellipsis-${num}`} disabled />);
      }
    }

    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => handleNavigate(currentPage + 1)}
        className="tiny-pagination-btn"
      >
        ›
      </Pagination.Next>
    );

    return items;
  };

  return (
    <div className="d-flex justify-content-center mt-3">
      <Pagination className="tiny-pagination">{renderPaginationItems()}</Pagination>
    </div>
  );
} 