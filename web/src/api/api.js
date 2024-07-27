export const server = process.env.REACT_APP_API_URI

export function makeRequest(request, body) {
     return new Promise(function(resolve, reject) {
          request.onload = () => {
               if (request.status >= 200 && request.status < 300) {
                    resolve({
                         Status: request.status,
                         Response: request.response,
                    })
               } else {
                    reject({
                         Status: request.status,
                         Response: request.responseText,
                    })
               }
          }
          request.onerror = () => {
               reject({
                    Status: request.status,
                    Response: request.responseText,
               })
          }
          request.ontimeout = () => {
               reject({
                  Status: 408,
                  Response: null,
              })
          }
          request.onabort = () => {
               reject({
                    Status: 408,
                    Response: null,
               })
          }
          request.send(body)
     })
}