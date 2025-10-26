import React from "react";
import "./DayPlanSidebar.css";

const DayPlanSidebar = ({ dayPlan, onClose, getPlaceDetails }) => {
  if (!dayPlan) return null;

  return (
    <div className="day-plan-sidebar">
      <button className="close-btn" onClick={onClose}>&times;</button>

      <h2 className="day-title">Day {dayPlan.day}: {dayPlan.name}</h2>

      <div className="timeline">
        {dayPlan.plan.map((item, idx) => {
          const place = getPlaceDetails(item.placeId);
          // Determine the icon to display
          const displayIcon =
            place?.icon?.options?.html ? (
              <span dangerouslySetInnerHTML={{ __html: place.icon.options.html }} />
            ) : (
              place?.icon || "📍" // Fallback to '📍' if no icon or html content
            );

          const nextTravel = item.travelTo;

          return (
            <React.Fragment key={idx}>
              {/* Conditional: If this is NOT the first item, show travel details leading to THIS item */}
              {idx > 0 && item.travelTo && ( // Only show travel details if it's not the first item, AND there are travel details
                <div className="timeline-connector">
                  <div className="line-segment"></div> {/* Shorter line segment for between items */}
                  <div className="travel-details">
                    <p className="travel-mode">{item.travelTo.mode} - {item.travelTo.durationMin} min</p>
                    <p className="travel-description">{item.travelTo.details}</p>
                  </div>
                </div>
              )}

              {/* Destination / Activity */}
              <div className="timeline-item">
                <div className="timeline-row">
                  <span className="icon">{displayIcon}</span>
                  <span className="place-name">{place?.title || item.activity}</span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default DayPlanSidebar;