/**
 * A collection of hand-picked, beautiful blurhash strings representing soft gradients and abstract shapes.
 * These are used as deterministic placeholders to avoid heavy image processing for list views.
 */
export const PLACEHOLDER_BLURHASHES = [
  'L15E,3?dt8xv.9tSj]oft8j]fkj[', // Cool Grey
  'L15hS#^*xaxu^*xtoLoet6oLjtj[', // Warm Grey
  'L14.JI%%o#tS%jo$j]kCo#j]fRfk', // Slate Blue
  'L05E:7~qx[-;~q%fofoyx[ofj[j[', // Pale Green
  'L15hPx^,xbxu^mxboMoft7oMjuj[', // Mauve Grey
  'L15E:BI9ogt6?dRifkj@t8axfQfQ', // Cool Grey
  'L15q@a9aoft7^*NGj@fRxaayfQfQ', // Warm Grey
  'L14_z-R2kDt6%%V=fRj@o#axfRfQ', // Slate Blue
  'L05OW%4Ut7xu~qIUj[j[x[WBfjfj', // Pale Green
  'L15q-Q9roft7^,NFjufjxbayfQfQ', // Mauve Grey
  'L35hfHozfQoz?wj]fQj]x^j[fQj[', // Cool Grey
  'L25}gXt7fQt7~poefQoe-oj[fQj[', // Warm Grey
  'L455UxogfQog%jj]fQj]tTfkfQfk', // Slate Blue
  'L25r3-t7fQt7~qoffQof%fj[fQj[', // Pale Green
  'L25}dVt7fQt7~XoMfQoM-qj[fQj[', // Mauve Grey
  'L15X_g_4tSx]DhM_aeWBozj[fRj[', // Cool Grey
  'L15;~+~Vxt%L4:IpWCWBt6j[jtj@', // Warm Grey
  'L255Ro%jo#tSMuV=axaxkDfkfRfR', // Slate Blue
  'L15hfC_Mxux]9FM{WBWBt7j[fQj[', // Pale Green
  'L15;]v~Xxb%354InWUWBs;j[juj[', // Mauve Grey
  'L45#nm?wx^xvofj[j[j[fQfQfQfQ', // Cool Grey
  'L36Hr;~W-p%2ofj[j[j[fQfQfQfQ', // Warm Grey
  'L55Od8%jtTt9ofj[fkfRfQfQfQfQ', // Slate Blue
  'L35=CH_M%fx[ofj[j[j[fQfQfQfQ', // Pale Green
  'L36Hl#~X-q%3ofj[j[j[fQfQfQfQ', // Mauve Grey
];

export const getPlaceholderBlurhash = (id: string | number): string => {
  const numericId = typeof id === 'string' ? parseInt(id, 10) || 0 : id;
  return PLACEHOLDER_BLURHASHES[numericId % PLACEHOLDER_BLURHASHES.length];
};
