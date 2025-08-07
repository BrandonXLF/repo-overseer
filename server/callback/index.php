<?php

include '../../.config.php';

$ch = curl_init();

if (!isset($_GET['code'])) {
	http_response_code(400);
	die('<script>window.close();</script>');
}

curl_setopt($ch, CURLOPT_URL, 'https://github.com/login/oauth/access_token');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
	'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
	'client_id' => $CLIENT_ID,
	'client_secret' => $CLIENT_SECRET,
	'code' => $_GET['code']
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$res = json_decode(curl_exec($ch));

?>

<script>
	window.opener.postMessage({
		source: 'github-auth',
		token: '<?php echo $res->access_token ?>',
	});

	window.close();
</script>
