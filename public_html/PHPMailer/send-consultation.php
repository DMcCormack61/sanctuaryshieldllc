<?php
/**
 * Sanctuary Shield - Consultation Form Handler
 * Simple, secure PHP backend for sending consultation requests
 */

// Set headers for JSON response
header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Honeypot check (basic spam protection)
if (!empty($_POST['website'])) {
    // Silent success for bots
    echo json_encode(['success' => true]);
    exit;
}

// Get and sanitize form data
$name     = trim(filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING));
$role     = trim(filter_input(INPUT_POST, 'role', FILTER_SANITIZE_STRING));
$church   = trim(filter_input(INPUT_POST, 'church', FILTER_SANITIZE_STRING));
$location = trim(filter_input(INPUT_POST, 'location', FILTER_SANITIZE_STRING));
$email    = trim(filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL));
$phone    = trim(filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING));
$message  = trim(filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING));

// Basic validation
$errors = [];

if (empty($name))    $errors[] = 'Name is required';
if (empty($role))    $errors[] = 'Role is required';
if (empty($church))  $errors[] = 'Church name is required';
if (empty($location))$errors[] = 'Location is required';
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Valid email is required';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

// Prepare email content
$to      = 'info@sanctuaryshieldllc.com';
$subject = 'New Sanctuary Shield Consultation Request - ' . $church;

$email_body = "
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h2 { color: #1e3a5f; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #1e3a5f; }
        .value { margin-top: 3px; }
        .message-box { background: #f8f9fa; padding: 15px; border-left: 4px solid #1e3a5f; }
    </style>
</head>
<body>
    <div class='container'>
        <h2>New Consultation Request</h2>
        
        <div class='field'>
            <div class='label'>Name:</div>
            <div class='value'>" . htmlspecialchars($name) . "</div>
        </div>
        
        <div class='field'>
            <div class='label'>Role:</div>
            <div class='value'>" . htmlspecialchars($role) . "</div>
        </div>
        
        <div class='field'>
            <div class='label'>Church:</div>
            <div class='value'>" . htmlspecialchars($church) . "</div>
        </div>
        
        <div class='field'>
            <div class='label'>Location:</div>
            <div class='value'>" . htmlspecialchars($location) . "</div>
        </div>
        
        <div class='field'>
            <div class='label'>Email:</div>
            <div class='value'><a href='mailto:" . htmlspecialchars($email) . "'>" . htmlspecialchars($email) . "</a></div>
        </div>
        
        " . (!empty($phone) ? "
        <div class='field'>
            <div class='label'>Phone:</div>
            <div class='value'>" . htmlspecialchars($phone) . "</div>
        </div>" : "") . "
        
        " . (!empty($message) ? "
        <div class='field'>
            <div class='label'>Message / Concerns:</div>
            <div class='message-box'>" . nl2br(htmlspecialchars($message)) . "</div>
        </div>" : "") . "
        
        <hr style='margin: 30px 0; border: none; border-top: 1px solid #ddd;'>
        <p style='font-size: 12px; color: #666;'>Submitted via Sanctuary Shield website on " . date('F j, Y \a\t g:i A T') . "</p>
    </div>
</body>
</html>
";

// Plain text version for email clients that don't support HTML
$plain_text = "New Sanctuary Shield Consultation Request\n\n";
$plain_text .= "Name: $name\n";
$plain_text .= "Role: $role\n";
$plain_text .= "Church: $church\n";
$plain_text .= "Location: $location\n";
$plain_text .= "Email: $email\n";
if (!empty($phone))    $plain_text .= "Phone: $phone\n";
if (!empty($message))  $plain_text .= "\nMessage / Concerns:\n$message\n";
$plain_text .= "\n---\nSubmitted: " . date('F j, Y g:i A T');

// Email headers
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: Sanctuary Shield <info@sanctuaryshieldllc.com>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send the email to Sanctuary Shield team
$mail_sent = mail($to, $subject, $email_body, $headers);

if ($mail_sent) {
    
    // === AUTO-REPLY CONFIRMATION TO SUBMITTER ===
    $confirm_subject = "Thank you – We've received your Sanctuary Shield consultation request";
    
    $confirm_body = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h2 { color: #1e3a5f; }
            p { margin-bottom: 16px; }
            .highlight { background: #f1e7d2; padding: 15px; border-radius: 8px; }
            .footer { font-size: 12px; color: #666; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h2>Thank you, " . htmlspecialchars($name) . ".</h2>
            
            <p>We’ve received your consultation request for <strong>" . htmlspecialchars($church) . "</strong> in " . htmlspecialchars($location) . ".</p>
            
            <div class='highlight'>
                <p><strong>What happens next:</strong><br>
                A member of the Sanctuary Shield team will personally review your request and contact you within <strong>1 business day</strong> to schedule your complimentary 45-minute consultation.</p>
            </div>
            
            <p>In the meantime, if you have any immediate questions, feel free to reply to this email.</p>
            
            <p>We look forward to partnering with you to protect what matters most — your church’s testimony, people, and resources.</p>
            
            <p style='margin-top: 25px;'>Grace and peace,<br>
            <strong>The Sanctuary Shield Team</strong></p>
            
            <div class='footer'>
                Sanctuary Shield LLC<br>
                info@sanctuaryshieldllc.com<br>
                Veteran-Owned | Serving Churches Nationwide
            </div>
        </div>
    </body>
    </html>
    ";
    
    $confirm_plain = "Thank you, $name.\n\n";
    $confirm_plain .= "We’ve received your consultation request for $church in $location.\n\n";
    $confirm_plain .= "What happens next:\n";
    $confirm_plain .= "A member of the Sanctuary Shield team will personally review your request and contact you within 1 business day to schedule your complimentary 45-minute consultation.\n\n";
    $confirm_plain .= "In the meantime, if you have any immediate questions, feel free to reply to this email.\n\n";
    $confirm_plain .= "We look forward to partnering with you to protect what matters most — your church’s testimony, people, and resources.\n\n";
    $confirm_plain .= "Grace and peace,\nThe Sanctuary Shield Team\n\n";
    $confirm_plain .= "Sanctuary Shield LLC | info@sanctuaryshieldllc.com\nVeteran-Owned | Serving Churches Nationwide";
    
    $confirm_headers  = "MIME-Version: 1.0\r\n";
    $confirm_headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $confirm_headers .= "From: Sanctuary Shield <info@sanctuaryshieldllc.com>\r\n";
    $confirm_headers .= "Reply-To: info@sanctuaryshieldllc.com\r\n";
    $confirm_headers .= "X-Mailer: PHP/" . phpversion();
    
    // Send confirmation email to the submitter
    mail($email, $confirm_subject, $confirm_body, $confirm_headers);
    
    // Return success to the website
    echo json_encode([
        'success' => true,
        'message' => 'Thank you. Your request has been received.'
    ]);
    
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Sorry, there was a problem sending your request. Please try again or email us directly at info@sanctuaryshieldllc.com'
    ]);
}
?>