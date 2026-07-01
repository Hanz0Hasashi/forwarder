import { evaluateJob } from './src/lib/server/ai/intakeAgent.js';
import { evaluateDriverBid } from './src/lib/server/ai/brokerAgent.js';

(async () => {
  console.log('--- TESTING INTAKE AGENT ---');
  await evaluateJob({ vehicle: { make: 'Ford', model: 'F-150' }, route: { pickup: 'LA', delivery: 'NY' }});
  
  console.log('\n--- TESTING BROKER AGENT ---');
  await evaluateDriverBid('Ford', 'F-150', 500, 100);
})();
