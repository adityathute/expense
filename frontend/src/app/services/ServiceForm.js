"use client";

import React, { useEffect } from "react";

export default function ServiceForm({
  newService,
  description,
  setDescription,
  handleInputChange,
  handleSubmit,
  handleLinkChange,
  addLink,
  removeLink,
  editingService,
  resetForm,
  formErrors,
  showLinksSection,
  setShowLinksSection
}) {
  useEffect(() => {
    if (editingService && newService.links.length > 0) {
      setShowLinksSection(true);
    }
  }, [editingService, newService.links.length, setShowLinksSection]);

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" name="name" value={newService.name} onChange={handleInputChange} required />
        {formErrors.name && <div className="error-text">{formErrors.name}</div>}
      </label>

      <label>
        Description:
        <textarea value={description ?? ""} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <label>
        Service Fee:
        <input type="number" name="service_fee" value={newService.service_fee} onChange={handleInputChange} />
      </label>

      <label>
        Service Charge:
        <input type="number" name="service_charge" value={newService.service_charge} onChange={handleInputChange} />
      </label>

      <label>
        Other Charge:
        <input type="number" name="other_charge" value={newService.other_charge} onChange={handleInputChange} />
      </label>

      <label>
        Pages Required:
        <input type="number" name="pages_required" value={newService.pages_required} onChange={handleInputChange} />
      </label>

      <label>
        Required Time (hours):
        <input type="number" step="0.1" name="required_time_hours" value={newService.required_time_hours} onChange={handleInputChange} />
      </label>

      {/* Links Section */}
      {showLinksSection && newService.links.length > 0 && (
        <>
          <h4>Links</h4>
          {newService.links.map((link, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="Label"
                value={link.label}
                onChange={(e) => handleLinkChange(index, "label", e.target.value)}
              />
              <input
                type="url"
                placeholder="URL"
                value={link.url}
                onChange={(e) => handleLinkChange(index, "url", e.target.value)}
              />
              <button type="button" onClick={() => removeLink(index)}>Remove</button>
            </div>
          ))}
        </>
      )}

      <button type="button" onClick={addLink}>Add Link</button>

      <button type="submit">{editingService ? "Update Service" : "Create Service"}</button>
      <button type="button" onClick={resetForm}>Cancel</button>
    </form>
  );
}
