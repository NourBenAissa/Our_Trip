import React from 'react';
import './DayPlanPopup.css';

const DayPlanPopup = ({ dayPlan, onClose, getPlaceDetails }) => {
  if (!dayPlan) return null;

  return (
    <div className="day-plan-popup">
      <button className="close-button" onClick={onClose}>&times;</button>
      <h3>Day {dayPlan.day}: {dayPlan.date}</h3>
      <h4>{dayPlan.name}</h4>
      <div className="plan-details">
        {dayPlan.plan.map((item, idx) => {
          const place = getPlaceDetails(item.placeId);
          return (
            <div key={idx} className="plan-item">
              {idx > 0 && item.travelTo && (
                <div className="travel-segment">
                  <span className="travel-icon">🚌</span>
                  <p>
                    <strong>Travel: {item.travelTo.mode.charAt(0).toUpperCase() + item.travelTo.mode.slice(1)}</strong>
                    <br/>
                    {item.travelTo.details}
                    {item.travelTo.durationMin && ` (${Math.round(item.travelTo.durationMin)} min)`}
                  </p>
                </div>
              )}
              <div className="activity-segment">
                <span className="activity-icon">📍</span>
                <p>
                  <strong>{place ? place.title : item.activity}</strong>
                  <br/>
                  {item.activity}
                  {item.durationHrs && ` (${item.durationHrs} hours)`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayPlanPopup;
