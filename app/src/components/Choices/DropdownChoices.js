import React, { Component } from 'react'

export default class DropdownChoices extends Component {
  renderDescription(activeChoice, level) {
    if (level.index === 1) {
      return (
        <div>
          <p>{ activeChoice.desc }</p>
          <p>Route Distance: {activeChoice.distance} miles</p>
          <p>Project Budget: ${activeChoice.budget / 1000000} million</p>
        </div>
      )
    } else {
      return activeChoice.desc
    }
  }

  render() {
    const {
      activeChoice,
      activeChoiceId,
      level,
      choices,
      handleChange,
    } = this.props

    return (
      <div className="Choices__body">
        <select name="modeChoice"
          onChange={e => handleChange(e, level.index, choices)}
          className="Choices__mode-dropdown"
          value={activeChoiceId}
        >
          <option value="">Select a {level.title}</option>{
            choices.map((item) => {
              return (
                <option value={item.id} key={item.id}>
                  {item.title}
                </option>
              )
            })
        }</select>

        { activeChoiceId ?
          <div>
            <h2>{ activeChoice.title }</h2>
            <div className="Choices__description">
              { this.renderDescription(activeChoice, level) }
            </div>
          </div>
          :
          <h3 className="Choices__empty-text">
            Choose a {level.title}<br /> to learn more about it
          </h3>
        }
      </div>
    )
  }
}
