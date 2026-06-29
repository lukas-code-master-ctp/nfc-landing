/* @ds-bundle: {"format":3,"namespace":"TapCarDesignSystem_fff1e7","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconChip","sourcePath":"components/core/IconChip.jsx"},{"name":"StatusBadge","sourcePath":"components/core/StatusBadge.jsx"},{"name":"PasswordInput","sourcePath":"components/forms/PasswordInput.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"DocumentRow","sourcePath":"components/product/DocumentRow.jsx"},{"name":"NfcLinkPanel","sourcePath":"components/product/NfcLinkPanel.jsx"},{"name":"VehicleCard","sourcePath":"components/product/VehicleCard.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"7f831956331f","components/core/Button.jsx":"7075556bfc02","components/core/Card.jsx":"04dd68d4d57f","components/core/IconChip.jsx":"6e388db70571","components/core/StatusBadge.jsx":"f4bf0136f01d","components/forms/PasswordInput.jsx":"d9e35277b476","components/forms/TextField.jsx":"c9e1ac8f4a34","components/product/DocumentRow.jsx":"061d6c4c5b17","components/product/NfcLinkPanel.jsx":"1d5dfea6a5cb","components/product/VehicleCard.jsx":"9a491f64ed0f","ui_kits/app/icons.jsx":"0f644308ae47","ui_kits/app/screens.jsx":"048a9e7d5fa2"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TapCarDesignSystem_fff1e7 = window.TapCarDesignSystem_fff1e7 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Circular user avatar — photo or initial on soft azul, matching UserMenu.
 */
function Avatar({
  name = '',
  email = '',
  src = null,
  size = 36,
  style = {},
  ...rest
}) {
  const initial = (name || email || '?').charAt(0).toUpperCase();
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: size,
      height: size,
      borderRadius: 'var(--radius-pill)',
      overflow: 'hidden',
      background: 'var(--azul-soft)',
      color: 'var(--azul)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: Math.round(size * 0.42),
      lineHeight: 1,
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    referrerPolicy: "no-referrer",
    style: {
      width: size,
      height: size,
      objectFit: 'cover'
    }
  }) : initial);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * TapCar primary action button. Mirrors the product's button styling:
 * azul fill for primary, line-bordered surface for secondary, ghost for
 * low-emphasis, and a danger variant for destructive actions.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  iconLeft = null,
  iconRight = null,
  fullWidth = false,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '6px 12px',
      fontSize: 'var(--text-sm)',
      gap: 6,
      height: 32
    },
    md: {
      padding: '10px 16px',
      fontSize: 'var(--text-sm)',
      gap: 6,
      height: 40
    },
    lg: {
      padding: '12px 18px',
      fontSize: 'var(--text-base)',
      gap: 8,
      height: 46
    }
  };
  const s = sizes[size] || sizes.md;
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    padding: s.padding,
    minHeight: s.height,
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'var(--font-sans)',
    fontSize: s.fontSize,
    fontWeight: 'var(--weight-semibold)',
    lineHeight: 1,
    borderRadius: 'var(--radius-sm)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background-color var(--duration-base) var(--ease-standard), color var(--duration-base) var(--ease-standard), border-color var(--duration-base) var(--ease-standard)',
    whiteSpace: 'nowrap'
  };
  const variants = {
    primary: {
      background: 'var(--azul)',
      color: 'var(--text-on-accent)'
    },
    secondary: {
      background: 'var(--superficie)',
      color: 'var(--tinta)',
      borderColor: 'var(--linea)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--azul)'
    },
    danger: {
      background: 'transparent',
      color: 'var(--vencido)'
    }
  };
  const hovers = {
    primary: {
      background: 'var(--azul-press)'
    },
    secondary: {
      background: 'var(--lienzo)'
    },
    ghost: {
      background: 'var(--azul-soft)'
    },
    danger: {
      background: 'var(--estado-vencido-bg)'
    }
  };
  const [hover, setHover] = React.useState(false);
  const v = variants[variant] || variants.primary;
  const h = !disabled && hover ? hovers[variant] : null;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      ...v,
      ...h,
      ...style
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * White surface card on the lienzo background — TapCar's primary container.
 * rounded-2xl, hairline linea border, soft shadow. Optional hover lift for
 * clickable cards.
 */
function Card({
  children,
  as = 'div',
  padding = 'var(--space-5)',
  interactive = false,
  dashed = false,
  style = {},
  ...rest
}) {
  const El = as;
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement(El, _extends({
    onMouseEnter: interactive ? () => setHover(true) : undefined,
    onMouseLeave: interactive ? () => setHover(false) : undefined,
    style: {
      display: 'block',
      background: dashed ? 'rgba(255,255,255,0.6)' : 'var(--superficie)',
      border: `1px ${dashed ? 'dashed' : 'solid'} var(--linea)`,
      borderRadius: 'var(--radius-lg)',
      padding,
      boxShadow: dashed ? 'none' : hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      transition: 'box-shadow var(--duration-base) var(--ease-standard)',
      cursor: interactive ? 'pointer' : 'default',
      textDecoration: 'none',
      color: 'inherit',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconChip.jsx
try { (() => {
/**
 * Signature TapCar element: a soft-azul rounded chip holding an icon.
 * Used as the brand mark backdrop and to lead vehicle/section cards.
 */
function IconChip({
  children,
  size = 44,
  tone = 'azul',
  radius = 'var(--radius-md)',
  style = {}
}) {
  const tones = {
    azul: {
      bg: 'var(--azul-soft)',
      fg: 'var(--azul)'
    },
    neutro: {
      bg: 'var(--lienzo)',
      fg: 'var(--acero)'
    },
    vigente: {
      bg: 'var(--estado-vigente-bg)',
      fg: 'var(--estado-vigente-fg)'
    },
    por_vencer: {
      bg: 'var(--estado-por-vencer-bg)',
      fg: 'var(--estado-por-vencer-fg)'
    },
    vencido: {
      bg: 'var(--estado-vencido-bg)',
      fg: 'var(--estado-vencido-fg)'
    }
  };
  const t = tones[tone] || tones.azul;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: size,
      height: size,
      borderRadius: radius,
      background: t.bg,
      color: t.fg,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { IconChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconChip.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusBadge.jsx
try { (() => {
/**
 * Status pill for document/vehicle expiry, mirroring the product's StatusBadge.
 * Four states map to the document-expiry color system.
 */
function StatusBadge({
  status = 'al_dia',
  variant = 'document',
  children,
  style = {}
}) {
  const palette = {
    al_dia: {
      bg: 'var(--estado-vigente-bg)',
      fg: 'var(--estado-vigente-fg)'
    },
    por_vencer: {
      bg: 'var(--estado-por-vencer-bg)',
      fg: 'var(--estado-por-vencer-fg)'
    },
    vencido: {
      bg: 'var(--estado-vencido-bg)',
      fg: 'var(--estado-vencido-fg)'
    },
    sin_vencimiento: {
      bg: 'var(--estado-neutro-bg)',
      fg: 'var(--estado-neutro-fg)'
    }
  };
  const labels = {
    document: {
      al_dia: 'Vigente',
      por_vencer: 'Por vencer',
      vencido: 'Vencido',
      sin_vencimiento: 'Sin vencimiento'
    },
    vehicle: {
      al_dia: 'Al día',
      por_vencer: 'Documentos por vencer',
      vencido: 'Documentos vencidos',
      sin_vencimiento: 'Sin vencimientos'
    }
  };
  const p = palette[status] || palette.al_dia;
  const text = children ?? (labels[variant] || labels.document)[status];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
      borderRadius: 'var(--radius-pill)',
      padding: '4px 10px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-semibold)',
      lineHeight: 1.2,
      background: p.bg,
      color: p.fg,
      ...style
    }
  }, text);
}
Object.assign(__ds_scope, { StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/forms/PasswordInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Password input with a show/hide eye toggle — mirrors the product's
 * PasswordInput. Same field styling as TextField.
 */
function PasswordInput({
  label,
  id,
  style = {},
  ...rest
}) {
  const reactId = React.useId();
  const inputId = id || reactId;
  const [show, setShow] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const EyeOff = /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    width: "20",
    height: "20",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9.88 9.88a3 3 0 1 0 4.24 4.24"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "2",
    x2: "22",
    y1: "2",
    y2: "22"
  }));
  const Eye = /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    width: "20",
    height: "20",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--acero)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: show ? 'text' : 'password',
    onFocus: e => {
      setFocus(true);
      rest.onFocus?.(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur?.(e);
    },
    style: {
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: 'var(--radius-sm)',
      border: `1px solid ${focus ? 'var(--azul)' : 'var(--linea)'}`,
      background: 'var(--superficie)',
      padding: '10px 44px 10px 12px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-base)',
      color: 'var(--tinta)',
      outline: 'none',
      boxShadow: focus ? '0 0 0 3px var(--ring-accent)' : 'none',
      transition: 'border-color var(--duration-base) var(--ease-standard), box-shadow var(--duration-base) var(--ease-standard)'
    }
  }, rest)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShow(s => !s),
    "aria-label": show ? 'Ocultar contraseña' : 'Mostrar contraseña',
    tabIndex: -1,
    style: {
      position: 'absolute',
      top: 0,
      right: 0,
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--acero)'
    }
  }, show ? EyeOff : Eye)));
}
Object.assign(__ds_scope, { PasswordInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/PasswordInput.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Labeled text input matching TapCar forms: linea border, azul focus ring,
 * acero label. Wraps a native input.
 */
function TextField({
  label,
  optional = false,
  hint,
  error,
  id,
  style = {},
  inputStyle = {},
  ...rest
}) {
  const reactId = React.useId();
  const inputId = id || reactId;
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--acero)'
    }
  }, label, optional && /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--weight-regular)',
      color: 'rgba(91,101,115,0.7)'
    }
  }, " (opcional)")), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    onFocus: e => {
      setFocus(true);
      rest.onFocus?.(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur?.(e);
    },
    style: {
      width: '100%',
      boxSizing: 'border-box',
      borderRadius: 'var(--radius-sm)',
      border: `1px solid ${error ? 'var(--vencido)' : focus ? 'var(--azul)' : 'var(--linea)'}`,
      background: 'var(--superficie)',
      padding: '10px 12px',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-base)',
      color: 'var(--tinta)',
      outline: 'none',
      boxShadow: focus && !error ? '0 0 0 3px var(--ring-accent)' : 'none',
      transition: 'border-color var(--duration-base) var(--ease-standard), box-shadow var(--duration-base) var(--ease-standard)',
      ...inputStyle
    }
  }, rest)), error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: 'var(--vencido)'
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: 'var(--acero)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/product/DocumentRow.jsx
try { (() => {
/**
 * Document row for the vehicle detail / public ficha: type label, expiry line,
 * status badge, and an action footer (view file / update / edit / delete).
 */
function DocumentRow({
  label = 'Permiso de Circulación',
  vence = null,
  status = 'al_dia',
  hasFile = true,
  actions = null,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("li", {
    style: {
      listStyle: 'none',
      background: 'var(--superficie)',
      border: '1px solid var(--linea)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      boxShadow: 'var(--shadow-sm)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: 'var(--text-base)',
      color: 'var(--tinta)'
    }
  }, label), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--acero)'
    }
  }, vence ? `Vence el ${vence}` : 'Sin vencimiento')), /*#__PURE__*/React.createElement(__ds_scope.StatusBadge, {
    status: status
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      paddingTop: 12,
      borderTop: '1px solid var(--linea)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)'
    }
  }, actions ?? (hasFile ? /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: 'var(--azul)',
      textDecoration: 'none'
    }
  }, "Ver archivo") : /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      color: 'var(--estado-por-vencer-fg)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    width: "14",
    height: "14",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4M12 17h.01"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
  })), "Sin archivo"))));
}
Object.assign(__ds_scope, { DocumentRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/DocumentRow.jsx", error: String((e && e.message) || e) }); }

// components/product/NfcLinkPanel.jsx
try { (() => {
/**
 * NFC link panel from the vehicle detail page: the public ficha URL in mono,
 * a copy button and a regenerate action.
 */
function NfcLinkPanel({
  url = 'https://tapcar.cl/v/8f3a2c9b1d',
  onCopy,
  onRegenerate,
  style = {}
}) {
  const [copied, setCopied] = React.useState(false);
  function copy() {
    try {
      navigator.clipboard?.writeText(url);
    } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--superficie)',
      border: '1px solid var(--linea)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-5)',
      boxShadow: 'var(--shadow-sm)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--azul)",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    width: "16",
    height: "16",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 8a6 6 0 0 1 12 0c0 4-3 5-3 9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 17c0-2 3-3 3-7a3 3 0 0 0-6 0"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 21v-1"
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: 'var(--text-base)',
      color: 'var(--tinta)'
    }
  }, "Enlace NFC")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '12px 0 0',
      wordBreak: 'break-all',
      background: 'var(--lienzo)',
      borderRadius: 'var(--radius-sm)',
      padding: '8px 12px',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-sm)',
      color: 'var(--tinta)'
    }
  }, url), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      color: 'var(--acero)'
    }
  }, "Graba esta URL en el chip NFC del veh\xEDculo."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    size: "sm",
    onClick: copy
  }, copied ? '¡Copiado!' : 'Copiar'), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "danger",
    size: "sm",
    onClick: onRegenerate
  }, "Regenerar")));
}
Object.assign(__ds_scope, { NfcLinkPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/NfcLinkPanel.jsx", error: String((e && e.message) || e) }); }

// components/product/VehicleCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function CarIcon({
  size = 24
}) {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    width: size,
    height: size,
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "17",
    r: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 17h6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "17",
    cy: "17",
    r: "2"
  }));
}

/**
 * Vehicle list row: car chip, marca·modelo·patente, doc count, and a
 * vehicle-level StatusBadge. Renders as a clickable link card.
 */
function VehicleCard({
  marca = 'Marca',
  modelo = 'Modelo',
  patente = 'AB CD 12',
  docCount = 0,
  status = 'al_dia',
  href = '#',
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      background: 'var(--superficie)',
      border: '1px solid var(--linea)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      transition: 'box-shadow var(--duration-base) var(--ease-standard)',
      textDecoration: 'none',
      color: 'inherit',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.IconChip, {
    size: 44
  }, /*#__PURE__*/React.createElement(CarIcon, {
    size: 24
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: 'var(--text-base)',
      color: 'var(--tinta)'
    }
  }, marca, " ", modelo, " \xB7 ", patente), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--acero)'
    }
  }, "Documentaci\xF3n \xB7 ", docCount, " ", docCount === 1 ? 'archivo' : 'archivos')), /*#__PURE__*/React.createElement(__ds_scope.StatusBadge, {
    status: status,
    variant: "vehicle"
  }));
}
Object.assign(__ds_scope, { VehicleCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/VehicleCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// TapCar — Lucide icon set used across the app (stroke 1.8, round caps).
// Exposed on window for the screen components.

const Ic = (paths, props = {}) => {
  const {
    size = 20,
    sw = 1.8,
    ...rest
  } = props;
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: sw,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, rest), paths);
};
const CarIcon = p => Ic(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "7",
  cy: "17",
  r: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 17h6"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "17",
  cy: "17",
  r: "2"
})), p);
const NfcIcon = p => Ic(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M6 8a6 6 0 0 1 12 0c0 4-3 5-3 9"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 17c0-2 3-3 3-7a3 3 0 0 0-6 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 21v-1"
})), p);
const PlusIcon = p => Ic(/*#__PURE__*/React.createElement("path", {
  d: "M12 5v14M5 12h14"
}), {
  sw: 2,
  ...p
});
const ChevronLeft = p => Ic(/*#__PURE__*/React.createElement("path", {
  d: "m15 18-6-6 6-6"
}), {
  sw: 2,
  ...p
});
const UserIcon = p => Ic(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "7",
  r: "4"
})), p);
const CardIcon = p => Ic(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
  width: "20",
  height: "14",
  x: "2",
  y: "5",
  rx: "2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M2 10h20"
})), p);
const LogOutIcon = p => Ic(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
}), /*#__PURE__*/React.createElement("path", {
  d: "m16 17 5-5-5-5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 12H9"
})), p);
const AlertIcon = p => Ic(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M12 9v4M12 17h.01"
}), /*#__PURE__*/React.createElement("path", {
  d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
})), {
  sw: 2,
  ...p
});
const FileIcon = p => Ic(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 2v6h6"
})), {
  sw: 2,
  ...p
});
const RefreshIcon = p => Ic(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 3v5h-5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 21v-5h5"
})), {
  sw: 2,
  ...p
});
const UploadIcon = p => Ic(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M17 8l-5-5-5 5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 3v12"
})), {
  sw: 2,
  ...p
});
const BellIcon = p => Ic(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
  d: "M10.27 21a2 2 0 0 0 3.46 0"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
})), p);
const GoogleIcon = ({
  size = 20
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  fill: "#4285F4",
  d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
}), /*#__PURE__*/React.createElement("path", {
  fill: "#34A853",
  d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
}), /*#__PURE__*/React.createElement("path", {
  fill: "#FBBC05",
  d: "M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
}), /*#__PURE__*/React.createElement("path", {
  fill: "#EA4335",
  d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
}));
Object.assign(window, {
  CarIcon,
  NfcIcon,
  PlusIcon,
  ChevronLeft,
  UserIcon,
  CardIcon,
  LogOutIcon,
  AlertIcon,
  FileIcon,
  RefreshIcon,
  UploadIcon,
  BellIcon,
  GoogleIcon
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/screens.jsx
try { (() => {
// TapCar app — screen components. Compose the design-system primitives
// from the compiled bundle. Exposed on window for index.html.

const DS = window.TapCarDesignSystem_fff1e7;
const {
  Button,
  TextField,
  PasswordInput,
  StatusBadge,
  IconChip,
  VehicleCard,
  DocumentRow,
  NfcLinkPanel,
  Avatar
} = DS;
const DOC_LABELS = {
  permiso_circulacion: 'Permiso de Circulación',
  revision_tecnica: 'Revisión Técnica',
  soap: 'SOAP',
  certificado_gases: 'Certificado de Gases',
  padron: 'Padrón'
};

// ── Brand mark + header ───────────────────────────────────────────────
function Brand({
  white = false
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(IconChip, {
    size: 28,
    radius: "var(--radius-sm)"
  }, /*#__PURE__*/React.createElement(CarIcon, {
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 'var(--text-base)',
      letterSpacing: '-0.02em',
      color: white ? '#fff' : 'var(--tinta)'
    }
  }, "Tap", /*#__PURE__*/React.createElement("span", {
    style: {
      color: white ? '#fff' : 'var(--azul)'
    }
  }, "Car")));
}
function AppHeader({
  email,
  onProfile,
  onLogout,
  onBrand
}) {
  const [open, setOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      borderBottom: '1px solid var(--linea)',
      background: 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(8px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 672,
      margin: '0 auto',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: onBrand,
    style: {
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Brand, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    "aria-label": "Men\xFA de usuario",
    style: {
      border: 'none',
      background: 'none',
      padding: 0,
      cursor: 'pointer',
      borderRadius: '50%'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    email: email,
    size: 36
  })), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setOpen(false),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 29
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 0,
      top: 44,
      zIndex: 30,
      width: 240,
      background: 'var(--superficie)',
      border: '1px solid var(--linea)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px',
      borderBottom: '1px solid var(--linea)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xs)',
      color: 'var(--acero)'
    }
  }, "Sesi\xF3n iniciada como"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      color: 'var(--tinta)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, email)), /*#__PURE__*/React.createElement(MenuItem, {
    icon: /*#__PURE__*/React.createElement(UserIcon, {
      size: 16
    }),
    onClick: () => {
      setOpen(false);
      onProfile && onProfile();
    }
  }, "Perfil"), /*#__PURE__*/React.createElement(MenuItem, {
    icon: /*#__PURE__*/React.createElement(CardIcon, {
      size: 16
    }),
    onClick: () => setOpen(false)
  }, "Facturaci\xF3n"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--linea)'
    }
  }), /*#__PURE__*/React.createElement(MenuItem, {
    icon: /*#__PURE__*/React.createElement(LogOutIcon, {
      size: 16
    }),
    danger: true,
    onClick: () => {
      setOpen(false);
      onLogout && onLogout();
    }
  }, "Cerrar sesi\xF3n"))))));
}
function MenuItem({
  icon,
  children,
  onClick,
  danger
}) {
  const [h, setH] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    role: "menuitem",
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      gap: 10,
      padding: '10px 16px',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: danger ? 'var(--vencido)' : 'var(--tinta)',
      background: h ? danger ? 'var(--estado-vencido-bg)' : 'var(--lienzo)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: danger ? 'var(--vencido)' : 'var(--acero)',
      display: 'inline-flex'
    }
  }, icon), children);
}

// ── Login ─────────────────────────────────────────────────────────────
function LoginScreen({
  onLogin
}) {
  const [isRegister, setIsRegister] = React.useState(false);
  return /*#__PURE__*/React.createElement("main", {
    style: {
      minHeight: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      background: 'var(--lienzo)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 384
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(IconChip, {
    size: 48,
    radius: "var(--radius-lg)"
  }, /*#__PURE__*/React.createElement(CarIcon, {
    size: 28
  }))), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '12px 0 0',
      fontSize: 'var(--text-2xl)',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: 'var(--tinta)'
    }
  }, "TapCar"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--text-sm)',
      color: 'var(--acero)'
    }
  }, "Ingresa para gestionar la documentaci\xF3n de tu flota.")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--superficie)',
      border: '1px solid var(--linea)',
      borderRadius: 'var(--radius-lg)',
      padding: 24,
      boxShadow: 'var(--shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    iconLeft: /*#__PURE__*/React.createElement(GoogleIcon, {
      size: 18
    }),
    onClick: onLogin,
    style: {
      fontWeight: 500
    }
  }, "Continuar con Google"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      margin: '16px 0',
      color: 'var(--acero)',
      fontSize: 'var(--text-xs)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      height: 1,
      flex: 1,
      background: 'var(--linea)'
    }
  }), "o", /*#__PURE__*/React.createElement("span", {
    style: {
      height: 1,
      flex: 1,
      background: 'var(--linea)'
    }
  })), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onLogin();
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    type: "email",
    placeholder: "Correo",
    defaultValue: "flota@transportes.cl"
  }), /*#__PURE__*/React.createElement(PasswordInput, {
    placeholder: "Contrase\xF1a",
    defaultValue: "secreto123"
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    fullWidth: true
  }, isRegister ? 'Crear cuenta' : 'Iniciar sesión')), /*#__PURE__*/React.createElement("button", {
    onClick: () => setIsRegister(v => !v),
    style: {
      width: '100%',
      marginTop: 16,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      color: 'var(--azul)'
    }
  }, isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'))));
}

// ── Dashboard ─────────────────────────────────────────────────────────
function Dashboard({
  vehicles,
  onOpen,
  onAdd
}) {
  const [adding, setAdding] = React.useState(false);
  const [form, setForm] = React.useState({
    patente: '',
    marca: '',
    modelo: '',
    anio: '',
    color: ''
  });
  const set = k => e => setForm({
    ...form,
    [k]: e.target.value
  });
  function submit(e) {
    e.preventDefault();
    if (!form.patente || !form.marca || !form.modelo) return;
    onAdd(form);
    setForm({
      patente: '',
      marca: '',
      modelo: '',
      anio: '',
      color: ''
    });
    setAdding(false);
  }
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 672,
      margin: '0 auto',
      padding: '32px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-2xl)',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: 'var(--tinta)'
    }
  }, "Mis veh\xEDculos"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--text-sm)',
      color: 'var(--acero)'
    }
  }, vehicles.length, " ", vehicles.length === 1 ? 'vehículo registrado' : 'vehículos registrados')), !adding && /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement(PlusIcon, {
      size: 16
    }),
    onClick: () => setAdding(true)
  }, "Nuevo veh\xEDculo")), adding && /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      background: 'var(--superficie)',
      border: '1px solid var(--linea)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      boxShadow: 'var(--shadow-sm)',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    label: "Patente",
    placeholder: "Patente",
    value: form.patente,
    onChange: set('patente')
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "Marca",
    placeholder: "Marca",
    value: form.marca,
    onChange: set('marca')
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "Modelo",
    placeholder: "Modelo",
    value: form.modelo,
    onChange: set('modelo')
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "A\xF1o",
    placeholder: "A\xF1o",
    value: form.anio,
    onChange: set('anio')
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "Color",
    optional: true,
    placeholder: "Color",
    value: form.color,
    onChange: set('color')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary"
  }, "Guardar"), /*#__PURE__*/React.createElement(Button, {
    type: "button",
    variant: "secondary",
    onClick: () => setAdding(false)
  }, "Cancelar"))), vehicles.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--linea)',
      background: 'rgba(255,255,255,0.6)',
      padding: '48px 24px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: 500,
      color: 'var(--tinta)'
    }
  }, "A\xFAn no tienes veh\xEDculos"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      fontSize: 'var(--text-sm)',
      color: 'var(--acero)'
    }
  }, "Registra tu primer veh\xEDculo para empezar a guardar su documentaci\xF3n.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, vehicles.map(v => /*#__PURE__*/React.createElement(VehicleCard, {
    key: v.id,
    marca: v.marca,
    modelo: v.modelo,
    patente: v.patente,
    docCount: v.docs.length,
    status: worst(v.docs),
    href: "#",
    onClick: e => {
      e.preventDefault();
      onOpen(v.id);
    }
  }))));
}
function worst(docs) {
  const order = {
    vencido: 3,
    por_vencer: 2,
    al_dia: 1,
    sin_vencimiento: 0
  };
  return docs.reduce((acc, d) => order[d.status] > order[acc] ? d.status : acc, 'al_dia');
}

// ── Vehicle detail ────────────────────────────────────────────────────
function VehicleDetail({
  vehicle,
  onBack,
  onFicha
}) {
  const [docs, setDocs] = React.useState(vehicle.docs);
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 672,
      margin: '0 auto',
      padding: '32px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      alignSelf: 'flex-start',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      color: 'var(--acero)'
    }
  }, /*#__PURE__*/React.createElement(ChevronLeft, {
    size: 16
  }), " Volver"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      background: 'var(--superficie)',
      border: '1px solid var(--linea)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      boxShadow: 'var(--shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement(IconChip, {
    size: 48
  }, /*#__PURE__*/React.createElement(CarIcon, {
    size: 28
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xl)',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: 'var(--tinta)'
    }
  }, vehicle.marca, " ", vehicle.modelo, " \xB7 ", vehicle.patente), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontSize: 'var(--text-sm)',
      color: 'var(--acero)'
    }
  }, vehicle.anio, " \xB7 ", vehicle.color || 'Sin color'))), /*#__PURE__*/React.createElement(NfcLinkPanel, {
    url: `https://tapcar.cl/v/${vehicle.token}`,
    onRegenerate: () => {}
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 'var(--text-lg)',
      fontWeight: 600,
      color: 'var(--tinta)'
    }
  }, "Documentos"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement(PlusIcon, {
      size: 16
    }),
    onClick: () => setDocs(d => [...d, {
      id: 'd' + Date.now(),
      tipo: 'certificado_gases',
      vence: '2027-01-15',
      status: 'al_dia',
      hasFile: true
    }])
  }, "Agregar documento")), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, docs.map(d => /*#__PURE__*/React.createElement(DocumentRow, {
    key: d.id,
    label: DOC_LABELS[d.tipo] || 'Otro',
    vence: d.vence,
    status: d.status,
    hasFile: d.hasFile,
    actions: /*#__PURE__*/React.createElement(DocActions, {
      doc: d
    })
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: onFicha,
    style: {
      alignSelf: 'flex-start',
      marginTop: 4,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      color: 'var(--azul)'
    }
  }, /*#__PURE__*/React.createElement(NfcIcon, {
    size: 16
  }), " Ver ficha p\xFAblica (fiscalizaci\xF3n)")));
}
function DocActions({
  doc
}) {
  const needsUpdate = doc.status === 'por_vencer' || doc.status === 'vencido';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      width: '100%'
    }
  }, doc.hasFile ? /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      color: 'var(--azul)',
      textDecoration: 'none'
    }
  }, "Ver archivo") : /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      color: 'var(--estado-por-vencer-fg)'
    }
  }, /*#__PURE__*/React.createElement(AlertIcon, {
    size: 14
  }), " Sin archivo"), needsUpdate && /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      color: 'var(--azul)',
      textDecoration: 'none'
    }
  }, "Actualizar"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      marginLeft: 'auto',
      color: 'var(--vencido)',
      textDecoration: 'none'
    }
  }, "Eliminar"));
}

// ── Public ficha (fiscalización) ──────────────────────────────────────
function PublicFicha({
  vehicle,
  onExit
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      background: 'var(--lienzo)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 576,
      margin: '0 auto',
      padding: '40px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onExit,
    style: {
      alignSelf: 'flex-start',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      color: 'var(--acero)'
    }
  }, /*#__PURE__*/React.createElement(ChevronLeft, {
    size: 16
  }), " Salir de la vista p\xFAblica"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      background: 'var(--superficie)',
      border: '1px solid var(--linea)',
      borderRadius: 'var(--radius-lg)',
      padding: 24,
      boxShadow: 'var(--shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement(IconChip, {
    size: 56
  }, /*#__PURE__*/React.createElement(CarIcon, {
    size: 32
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-2xl)',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: 'var(--tinta)'
    }
  }, vehicle.marca, " ", vehicle.modelo, " \xB7 ", vehicle.patente), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontSize: 'var(--text-base)',
      color: 'var(--acero)'
    }
  }, vehicle.anio, " \xB7 ", vehicle.color || 'Sin color'))), /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 0 4px',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      color: 'var(--acero)'
    }
  }, "Documentaci\xF3n"), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, vehicle.docs.map(d => /*#__PURE__*/React.createElement(DocumentRow, {
    key: d.id,
    label: DOC_LABELS[d.tipo] || 'Otro',
    vence: d.vence,
    status: d.status,
    hasFile: d.hasFile,
    actions: d.hasFile ? /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => e.preventDefault(),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--azul)',
        fontWeight: 600,
        textDecoration: 'none'
      }
    }, /*#__PURE__*/React.createElement(FileIcon, {
      size: 18
    }), " Ver documento (PDF)") : /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--estado-por-vencer-fg)',
        fontWeight: 500
      }
    }, /*#__PURE__*/React.createElement(AlertIcon, {
      size: 16
    }), " Sin archivo adjunto")
  })))), /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      fontSize: 'var(--text-xs)',
      color: 'var(--acero)'
    }
  }, "Ficha de fiscalizaci\xF3n \xB7 solo lectura")));
}
Object.assign(window, {
  AppHeader,
  Brand,
  LoginScreen,
  Dashboard,
  VehicleDetail,
  PublicFicha
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/screens.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconChip = __ds_scope.IconChip;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.PasswordInput = __ds_scope.PasswordInput;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.DocumentRow = __ds_scope.DocumentRow;

__ds_ns.NfcLinkPanel = __ds_scope.NfcLinkPanel;

__ds_ns.VehicleCard = __ds_scope.VehicleCard;

})();
