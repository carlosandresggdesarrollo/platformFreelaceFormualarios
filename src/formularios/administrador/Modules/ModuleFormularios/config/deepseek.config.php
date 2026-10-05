<?php
return [
    'api_key' => getenv('DEEPSEEK_API_KEY') ?: '',
    'model'   => 'deepseek-chat',
    'api_url' => 'https://api.deepseek.com/chat/completions',
];
