# Helper Server

This is a Node.js private server that hosts the Helper. It contains:

- Node.js RADIUS server
	* Receives bandwidth accounting requests from StrongSwan VPN instances
	* Logs the bandwidth usage for clients to the database
- Node.js Express server
	* Receives client throttling requests from VPN servers' Bandwidth script at `/bandwidth-restriction`
	* Checks database to see if a client should be throttled (expired subscription, excessive bandwidth usage)

Helper is only accessible by the private network.

## Prerequisites

* Run the Helper [CloudFormation](https://github.com/confirmedcode/Server-CloudFormation) and all its prerequisites

## Bandwidth Check

### Check Client Bandwidth Restriction
__Request__

```
GET /bandwidth-restriction
```

Name | Type | Description
--- | --- | ---
`client_id` | `string` | __Required__ The client ID to check throttling for.

__Response__

If Throttled

```
{
	ratelimitkbps: 10000
}
```

If Not Throttled

```
{
	throttle: false
}
```

## Feedback
If you have any questions, concerns, or other feedback, please let us know any feedback in Github issues or by e-mail.

We also have a bug bounty program -- please email <engineering@confirmedvpn.com> for details.

## License

This project is licensed under the GPL License - see the [LICENSE.md](LICENSE.md) file for details

## Contact

<engineering@confirmedvpn.com>