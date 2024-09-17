export function formatStyle(styleProps: Record<string, any>) {
  const keys = Object.keys(styleProps);
  const styleArr = keys.map((key) => {
    const formatKey = key.replace(/[A-Z]/g, (A) => `-${A.toLowerCase()}`);
    const value = styleProps[key];

    return `${formatKey}:${value}`;
  });

  return styleArr.join(';');
}

export function pxTovw(components = []) {
  const reg = /^(\d+(\.\d+)?)px$/;
  components.forEach((component) => {
    const props = component.props || {};
    Object.keys(props).forEach((key) => {
      const val = props[key];
      if (typeof val !== 'string') return;
      if (!reg.test(val)) return;

      const arr = val.match(reg) || [];
      console.log(arr);

      const num = parseFloat(arr[1]);
      const vw = (num / 375) * 100;

      props[key] = `${vw.toFixed(2)}vw`;
    });
  });
}
