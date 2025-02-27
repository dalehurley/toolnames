// Network Latency Simulator Service Worker

// Active simulation configuration
let simulationActive = false;
let currentProfile = null;

// Keep track of active requests
const activeRequests = new Map();

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data.type === 'START_SIMULATION') {
    simulationActive = true;
    currentProfile = event.data.profile;
    console.log('Network simulation started with profile:', currentProfile);
  } else if (event.data.type === 'STOP_SIMULATION') {
    simulationActive = false;
    currentProfile = null;
    console.log('Network simulation stopped');
  }
});

// Handle fetch events to intercept network requests
self.addEventListener('fetch', (event) => {
  // Skip simulation if not active or for service worker assets
  if (!simulationActive || 
      event.request.url.includes('network-simulator-sw.js') ||
      event.request.url.includes('favicon.ico')) {
    return;
  }

  const requestId = generateUniqueId();
  const startTime = Date.now();
  const requestMethod = event.request.method;
  const requestUrl = event.request.url;
  
  // Calculate latency based on current profile
  const latency = calculateLatency(currentProfile);
  
  // Notify the main thread about the request start
  if (self.clients) {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'REQUEST_STARTED',
          requestId,
          url: requestUrl,
          method: requestMethod,
          startTime,
          latencyApplied: latency
        });
      });
    });
  }
  
  // Clone the request
  const requestClone = event.request.clone();
  
  // Apply throttling
  event.respondWith(
    new Promise((resolve) => {
      // Simulate latency
      setTimeout(() => {
        fetch(requestClone)
          .then(response => {
            const responseClone = response.clone();
            
            // Get the size of the response
            responseClone.blob().then(blob => {
              const endTime = Date.now();
              const size = blob.size;
              
              // Notify the main thread about the request completion
              if (self.clients) {
                self.clients.matchAll().then(clients => {
                  clients.forEach(client => {
                    client.postMessage({
                      type: 'REQUEST_COMPLETED',
                      requestId,
                      endTime,
                      status: response.status,
                      size
                    });
                  });
                });
              }
            });
            
            // Apply bandwidth throttling by creating a slow stream
            if (response.body && currentProfile) {
              const { readable, writable } = new TransformStream({
                transform(chunk, controller) {
                  // Apply bandwidth throttling
                  controller.enqueue(chunk);
                }
              });
              
              // Throttle the response based on download speed
              const reader = response.body.getReader();
              const write = writable.getWriter();
              
              // Process the stream with bandwidth throttling
              pumpAndThrottle(reader, write, currentProfile.downloadSpeed);
              
              // Create a new response with the throttled body
              const newResponse = new Response(readable, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
              });
              
              resolve(newResponse);
            } else {
              // If we can't manipulate the body, just return the original response
              resolve(response);
            }
          })
          .catch(err => {
            console.error('Network simulation fetch error:', err);
            
            // Check if we should simulate packet loss
            if (shouldDropPacket(currentProfile)) {
              // Simulate a network error
              const errorResponse = new Response('Network error', { 
                status: 503, 
                statusText: 'Service Unavailable' 
              });
              
              resolve(errorResponse);
            } else {
              // If not simulating packet loss, just resolve with the error
              throw err;
            }
          });
      }, latency);
    })
  );
});

// Helper function to generate a unique request ID
function generateUniqueId() {
  return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Calculate latency with jitter based on the profile
function calculateLatency(profile) {
  if (!profile) return 0;
  
  // Base latency from profile
  const baseLatency = profile.latency;
  
  // Add some random jitter (±20%)
  const jitter = baseLatency * 0.2 * (Math.random() - 0.5);
  
  return Math.max(0, Math.round(baseLatency + jitter));
}

// Determine if a packet should be dropped based on packet loss percentage
function shouldDropPacket(profile) {
  if (!profile || !profile.packetLoss) return false;
  
  // Convert percentage to probability (0-1)
  const dropProbability = profile.packetLoss / 100;
  
  // Random check against the probability
  return Math.random() < dropProbability;
}

// Function to pump and throttle data based on bandwidth
async function pumpAndThrottle(reader, writer, kbps) {
  const bytesPerSecond = kbps * 1024 / 8; // Convert kbps to bytes per second
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        await writer.close();
        return;
      }
      
      // Calculate delay based on chunk size and bandwidth
      const chunkSizeBytes = value.byteLength;
      const delayMs = (chunkSizeBytes / bytesPerSecond) * 1000;
      
      // Apply throttling delay
      if (delayMs > 5) { // Only apply meaningful delays
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
      // Write the chunk
      await writer.write(value);
    }
  } catch (err) {
    console.error('Error in stream processing:', err);
    writer.abort(err);
  }
} 