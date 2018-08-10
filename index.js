import grpc from 'grpc';
import fs from 'fs';
import { loadSync } from '@grpc/proto-loader'

require('dotenv').config()

// Lnd admin macaroon is at ~/.lnd/admin.macaroon on Linux and
// ~/Library/Application Support/Lnd/admin.macaroon on Mac
var m = fs.readFileSync(process.env.ADMIN_MACAROON_PATH);
var macaroon = m.toString('hex');

// build meta data credentials
var metadata = new grpc.Metadata()
metadata.add('macaroon', macaroon)
var macaroonCreds = grpc.credentials.createFromMetadataGenerator((_args, callback) => {
  callback(null, metadata);
});

// build ssl credentials using the cert the same as before
var lndCert = fs.readFileSync(process.env.TLS_CERT_PATH);
var sslCreds = grpc.credentials.createSsl(lndCert);

// combine the cert credentials and the macaroon auth credentials
// such that every call is properly encrypted and authenticated
var credentials = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);

// Pass the crendentials when creating a channel
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
var client = new lnrpc.Lightning('127.0.0.1:10009', credentials);

client.getInfo({}, (err, res) => { console.log(res); });
