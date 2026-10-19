import { Component } from "react";

/**
 * Keeps a half-typed value (an unfinished date, say) from taking the
 * editor down: the preview just waits for valid input. `value` is the
 * serialized form, so the boundary retries only when the form changes.
 */
export class PreviewBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, lastValue: props.value };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  static getDerivedStateFromProps(props, state) {
    // Try again whenever the form changes.
    if (props.value !== state.lastValue) {
      return { failed: false, lastValue: props.value };
    }
    return null;
  }

  render() {
    if (this.state.failed) {
      return (
        <p className="text-sm text-(--color-text-muted)">
          The preview appears once the fields are filled in.
        </p>
      );
    }
    return this.props.children;
  }
}
