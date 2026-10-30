let counter = 1000;

export function generateComplaintId() {
  const timestamp = Date.now().toString().slice(-4);
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  counter = (counter + 1) % 9000;
  return `CAI-${counter + randomSuffix}`;
}
