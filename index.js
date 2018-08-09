import grpc from 'grpc';
import fs from 'fs';
import { loadSync } from '@grpc/proto-loader'

//  Lnd cert is at ~/.lnd/tls.cert on Linux and
//  ~/Library/Application Support/Lnd/tls.cert on Mac
var lndCert = fs.readFileSync("/home/gustavosilva/.lnd/tls.cert");
// console.log(grpc.credentials.createSsl);
var credentials = grpc.credentials.createSsl(lndCert);

// The following options object closely approximates the existing behavior of grpc.load.
// See https://github.com/grpc/grpc-node/blob/master/packages/grpc-protobufjs/README.md
const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
}
const packageDefinition = loadSync("./rpc.proto", options)
 // Load gRPC package definition as a gRPC object hierarchy.
const lnrpcDescriptor = grpc.loadPackageDefinition(packageDefinition)

// console.log(lnrpcDescriptor.lnrpc);
var lnrpc = lnrpcDescriptor.lnrpc;
var lightning = new lnrpc.Lightning('localhost:10009', credentials);

lightning.getInfo({}, function(err, response) {
  	console.log('GetInfo:', response);
  });


// var call = lightning.subscribeInvoices({});
// call.on('data', function(invoice) {
//     console.log(invoice);
// })
// .on('end', function() {
//   // The server has finished sending
// })
// .on('status', function(status) {
//   // Process status
//   console.log("Current status" + status);
// });
