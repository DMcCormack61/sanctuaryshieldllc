<?php
/**
 * send-comment.php
 * Handles blog comment submissions and emails them to info@sanctuaryshieldllc.com
 */

$smtpHost       = 'smtp.siteground.com';
$smtpPort       = 587;
$smtpUsername   = 'info@sanctuaryshieldllc.com';
$smtpPassword   = 'YOUR_SMTP_PASSWORD_HERE'; // Update this securely
$smtpEncryption = 'tls';

$toEmail        = 'info@sanctuaryshieldllc.com';
$fromEmail      = 'info@sanctuaryshieldllc.com';
$fromName       = 'Sanctuary Shield Blog Comments';

function sanitize($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function jsonResponse($success, $message) {
    header('Content-Type: application/json');
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// Only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed');
}

// Honeypot
if (!empty($_POST['website'])) {
    jsonResponse(true, 'Thank you');
}

// Collect data
$name    = sanitize($_POST['name'] ?? '');
$email   = sanitize($_POST['email'] ?? '');
$comment = sanitize($_POST['comment'] ?? '');
$consent = isset($_POST['consent']);

if (empty($name) || empty($email) || empty($comment) || !$consent || !isValidEmail($email)) {
    jsonResponse(false, 'Please fill all fields correctly and accept the terms.');
}

// Build email
$emailBody = "New comment on blog post: The OODA Loop\n\n";
$emailBody .= "Name: $name\n";
$emailBody .= "Email: $email\n";
$emailBody .= "Comment:\n$comment\n\n";
$emailBody .= "Submitted: " . date('Y-m-d H:i:s') . "\n";
$emailBody .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown');

$headers = "From: $fromName <$fromEmail>\r\n";
$headers .= "Reply-To: $name <$email>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($toEmail, "New Blog Comment - OODA Loop", $emailBody, $headers);

// For production, use PHPMailer like in send-consultation.php for better reliability

if ($sent) {
    jsonResponse(true, 'Comment received');
} else {
    jsonResponse(false, 'Failed to send comment. Please try again later.');
}
?>