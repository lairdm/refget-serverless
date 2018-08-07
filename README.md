# Refget Serverless

An implementation of the Refget protocol for AWS using the Serverless framework.

## DynammoDB documents

Checksum lookups are handled via a DynamoDB table. As there are two checksums for each sequence and DynamoDB only allows one index column (when a second index would have a very low cardinality, at least), the data is denormalized. There is a document for each of the checksums per sequence. However for the metadata endpoint we need the alternate checksum as well.

The document structure allows for future growth of more checksum types and aliases to be stored, as defined by the Refget specification.

{
  "aliases": [],
  "bucket": "S3_bucket_name",
  "checksum": "2085c82d80500a91dd0b8aa9237b0e43f1c07809bd6e6785",
  "checksum_type": "trunc512",
  "checksums": {
    "md5": "3332ed720ac7eaa9b3655c06f6b9e196"
  },
  "filename": "NC.faa",
  "is_circ": true,
  "seq_length": 5384
}