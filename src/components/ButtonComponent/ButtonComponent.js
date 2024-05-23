import React from "react";
import { Button } from "react-bootstrap";

export const ButtonComponent = (props) => {
  return (
    <Button
      type={props.type}
      className={props.class}
      onClick={props.onClick}
      disabled={props.disabled}
      variant={props.variant}
    >
      {props.name} {props.component}
    </Button>
  );
};
