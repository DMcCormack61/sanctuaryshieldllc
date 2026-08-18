<?php
/**
 * send-consultation.php
 * Handles the Sanctuary Shield consultation form submission using PHPMailer + SMTP.
 *
 * REQUIREMENTS:
 * - PHPMailer installed (recommended via Composer: composer require phpmailer/phpmailer)
 * - Update the SMTP settings below with your actual credentials.
 *
 * Usage:
 * - Place this file next to index.html.
 * - Make sure "vendor/autoload.php" is accessible (or adjust the require path).
 * - For local testing, use a PHP server that supports your SMTP (e.g. Laragon, XAMPP + SMTP config).
 */

// ===================== LOAD PHPMailer (with fallback) =====================
$usePHPMailer = false;
$phpMailerClass = null;
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
    if (class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
        $phpMailerClass = 'PHPMailer\\PHPMailer\\PHPMailer';
        $usePHPMailer = true;
    }
}

// ===================== SMTP & EMAIL CONFIGURATION =====================
$smtpHost       = 'smtp.siteground.com';           // e.g. smtp.gmail.com, smtp.office365.com, mail.yourdomain.com
$smtpPort       = 587;                          // 587 for TLS, 465 for SSL
$smtpUsername   = 'info@sanctuaryshieldllc.com';         // Usually your full email address
$smtpPassword   = 'your-smtp-password';         // App password if using Gmail/Outlook
$smtpEncryption = 'tls';                        // 'tls' or 'ssl'

$toEmail        = 'info@sanctuaryshieldllc.com';   // Where you want consultation requests to go
$fromEmail      = 'info@sanctuaryshieldllc.com';   // Must be a verified sender on your SMTP service
$fromName       = 'Sanctuary Shield';

$subject        = 'New Sanctuary Shield Consultation Request';

// Optional: Send auto-reply confirmation to the person who filled out the form
$sendAutoReply      = true;
$autoReplySubject   = 'Thank you for contacting Sanctuary Shield';

// ===================== HELPER FUNCTIONS =====================
function sanitize($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function jsonResponse($success, $message = '', $data = []) {
    header('Content-Type: application/json');
    http_response_code($success ? 200 : 400);
    echo json_encode(array_merge(
        ['success' => $success, 'message' => $message],
        $data
    ));
    exit;
}

/**
 * Send an email. Uses PHPMailer + SMTP if available, falls back to mail().
 */
function sendEmail($to, $subject, $body, $replyToEmail = null, $replyToName = null) {
    global $smtpHost, $smtpPort, $smtpUsername, $smtpPassword, $smtpEncryption;
    global $fromEmail, $fromName;
    global $usePHPMailer, $phpMailerClass;

    if ($usePHPMailer && $phpMailerClass) {
        $mail = new $phpMailerClass(true);
        try {
            // SMTP settings
            $mail->isSMTP();
            $mail->Host       = $smtpHost;
            $mail->SMTPAuth   = true;
            $mail->Username   = $smtpUsername;
            $mail->Password   = $smtpPassword;
            $mail->SMTPSecure = $smtpEncryption;
            $mail->Port       = $smtpPort;

            // Sender & recipient
            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($to);

            if ($replyToEmail) {
                $mail->addReplyTo($replyToEmail, $replyToName);
            }

            // Content
            $mail->isHTML(false);
            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->CharSet = 'UTF-8';

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log('PHPMailer Error: ' . $mail->ErrorInfo);
            // fall through to mail() fallback
        }
    }

    // Fallback to PHP mail()
    $headers = "From: {$fromName} <{$fromEmail}>\r\n";
    if ($replyToEmail) {
        $headers .= "Reply-To: {$replyToName} <{$replyToEmail}>\r\n";
    }
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    return mail($to, $subject, $body, $headers);
}

// ===================== MAIN LOGIC =====================

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Method Not Allowed';
    exit;
}

// Honeypot check (field is named "website")
if (!empty($_POST['website'])) {
    // Silent fail for spam bots
    jsonResponse(true, 'Request received.');
    exit;
}

// Collect and sanitize fields
$name     = sanitize($_POST['name'] ?? '');
$role     = sanitize($_POST['role'] ?? '');
$church   = sanitize($_POST['church'] ?? '');
$location = sanitize($_POST['location'] ?? '');
$email    = sanitize($_POST['_replyto'] ?? '');   // Note: form field is named _replyto
$phone    = sanitize($_POST['phone'] ?? '');
$message  = sanitize($_POST['message'] ?? '');
$consent  = isset($_POST['consent']) ? sanitize($_POST['consent']) : '';

// Server-side validation
$errors = [];

if (empty($name)) {
    $errors[] = 'Full name is required.';
}
if (empty($role)) {
    $errors[] = 'Your role is required.';
}
if (empty($church)) {
    $errors[] = 'Church name is required.';
}
if (empty($location)) {
    $errors[] = 'City / State is required.';
}
if (empty($email) || !isValidEmail($email)) {
    $errors[] = 'A valid email address is required.';
}
if (empty($consent)) {
    $errors[] = 'The confidentiality agreement must be checked.';
}
if (!empty($message) && strlen($message) > 2000) {
    $errors[] = 'Message is too long.';
}

if (!empty($errors)) {
    jsonResponse(false, 'Please correct the following issues:', ['errors' => $errors]);
}

// ===================== BUILD EMAIL BODY =====================
$emailBody = "A new consultation request has been submitted via the website.\n\n";
$emailBody .= "==================================\n";
$emailBody .= "CONTACT DETAILS\n";
$emailBody .= "==================================\n";
$emailBody .= "Name:        {$name}\n";
$emailBody .= "Role:        {$role}\n";
$emailBody .= "Church:      {$church}\n";
$emailBody .= "Location:    {$location}\n";
$emailBody .= "Email:       {$email}\n";
$emailBody .= "Phone:       " . ($phone ?: 'Not provided') . "\n\n";

$emailBody .= "MESSAGE / CONCERNS:\n";
$emailBody .= "----------------------------------\n";
$emailBody .= ($message ?: 'No additional details provided.') . "\n\n";

$emailBody .= "==================================\n";
$emailBody .= "Submitted: " . date('Y-m-d H:i:s') . " (server time)\n";
$emailBody .= "IP Address: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "\n";
$emailBody .= "User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown') . "\n";

// ===================== SEND MAIN EMAIL =====================
$mainEmailSent = sendEmail(
    $toEmail,
    $subject,
    $emailBody,
    $email,           // Reply-To
    $name
);

if (!$mainEmailSent) {
    error_log('Sanctuary Shield: Failed to send consultation email for ' . $email);
    // Do not show failure to user; they see success. Admin can check logs or mailbox.
}

// ===================== AUTO-REPLY (optional) =====================
if ($sendAutoReply) {
    $autoReplyBody = "Hello {$name},\n\n";
    $autoReplyBody .= "Thank you for reaching out to Sanctuary Shield. We have received your consultation request and will contact you within one business day.\n\n";
    $autoReplyBody .= "Here is a copy of the information you submitted:\n\n";
    $autoReplyBody .= "Name: {$name}\n";
    $autoReplyBody .= "Church: {$church}\n";
    $autoReplyBody .= "Location: {$location}\n";
    $autoReplyBody .= "Email: {$email}\n\n";
    $autoReplyBody .= "We look forward to speaking with you.\n\n";
    $autoReplyBody .= "Blessings,\n";
    $autoReplyBody .= "The Sanctuary Shield Team\n\n";
    $autoReplyBody .= "——\n";
    $autoReplyBody .= "Sanctuary Shield LLC\n";
    $autoReplyBody .= "info@sanctuaryshieldllc.com\n";

    sendEmail(
        $email,
        $autoReplySubject,
        $autoReplyBody
    );
}

// Success response for AJAX (used by the JavaScript in index.html)
jsonResponse(true, 'Your consultation request has been received. We will contact you soon.');

// ===================== NON-AJAX FALLBACK =====================
?>
<?php if (!empty($_POST) && !isset($_SERVER['HTTP_X_REQUESTED_WITH'])): ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Thank You | Sanctuary Shield</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; line-height: 1.6; }
            h1 { color: #1e3a5f; }
            a { color: #1e3a5f; }
        </style>
    </head>
    <body>
        <h1>Thank you!</h1>
        <p>Your consultation request has been received.</p>
        <p>We will contact you within one business day.</p>
        <p><a href="index.html">Return to the website</a></p>
    </body>
    </html>
<?php endif; ?>