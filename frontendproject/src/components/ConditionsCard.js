import React from 'react';
import './ConditionsCard.css';

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const readField = (data, field) => {
  const lower = field.toLowerCase();
  return (
    data?.[field] ??
    data?.[lower] ??
    data?.[field.toUpperCase()] ??
    data?.[`${lower}Code`] ??
    data?.[`${lower}Name`] ??
    ''
  );
};

export default function ConditionsCard({
  data = {},
  title = 'Rule Conditions',
  emptyMessage = 'No conditions available',
}) {
  const baseColumns = ['Origin', 'Destination', 'Commodity'];
  const columns = baseColumns.map((header) => ({
    header,
    value: readField(data, header),
  }));

  const hasAtLeastOneValue = columns.some((item) => formatValue(item.value) !== '—');

  if (!hasAtLeastOneValue) {
    return (
      <section className="conditions-card" aria-label={title}>
        <h3 className="conditions-card__title">{title}</h3>
        <p className="conditions-card__empty">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="conditions-card" aria-label={title}>
      <h3 className="conditions-card__title">{title}</h3>

      <div className="conditions-card__grid" role="list" aria-label="Condition fields">
        {columns.map(({ header, value }) => (
          <div className="conditions-card__column" role="listitem" key={header}>
            <div className="conditions-card__header">{header}</div>
            <div className="conditions-card__value" title={formatValue(value)}>
              {formatValue(value)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
