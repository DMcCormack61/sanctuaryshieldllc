<?php
/**
 * Sanctuary Shield - SMTP Test Script
 * Use this to test your SMTP configuration before going live.
 * 
 * Instructions:
 * 1. Update the SMTP settings below (same as send-consultation.php)
 * 2. Upload this file to your server
 * 3. Visit https://yoursite.com/test-smtp.php in your browser
 * 4. Check if you receive the test email
 */

// ==================== SMTP SETTINGS (Copy from send-consultation.php) ====================

// --- BREVO (Recommended) ---
// $smtpHost       = 'smtp-relay.brevo.com';
// $smtpPort       = 587;
// $smtpUsername   = 'your-brevo-email@example.com';
// $smtpPassword   = 'YOUR_BREVO_SMTP_KEY';
// $smtpEncryption = 'tls';

// --- SITEGROUND (Alternative) ---
$smtpHost       = 'smtp.siteground.com';           // Change to the hostname shown in your Site Tools
$smtpPort       = 587;
$smtpUsername   = 'info@sanctuaryshieldllc.com';   // Your SiteGround email address
$smtpPassword   = 'YOUR_EMAIL_PASSWORD_HERE';      // The password for this email account
$smtpEncryption = 'tls';

$fromEmail = 'info@sanctuaryshieldllc.com';
$fromName  = 'Sanctuary Shield';
$testEmail = 'info@sanctuaryshieldllc.com';        // Where to send the test email

// ==================== END SETTINGS ====================

require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: text/html; charset=UTF-8');

echo "<h2>Sanctuary Shield - SMTP Test</h2>";

$mail = new PHPMailer(true);

try {
    // SMTP Configuration
    $mail->isSMTP();
    $mail->Host       = $smtpHost;
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtpUsername;
    $mail->Password   = $smtpPassword;
    $mail->SMTPSecure = $smtpEncryption;
    $mail->Port       = $smtpPort;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom($fromEmail, $fromName);
    $mail->addAddress($testEmail);
    $mail->addReplyTo($fromEmail, $fromName);

    $mail->isHTML(true);
    $mail->Subject = 'SMTP Test from Sanctuary Shield Website';
    $mail->Body    = "
        <h3>SMTP Test Successful!</h3>
        <p>This email confirms that your SMTP configuration is working correctly.</p>
        <p><strong>Host:</strong> {$smtpHost}<br>
           <strong>Port:</strong> {$smtpPort}<br>
           <strong>Encryption:</strong> {$smtpEncryption}</p>
        <p>Sent at: " . date('Y-m-d H:i:s') . "</p>
    ";
    $mail->AltBody = "SMTP Test Successful! Configuration is working.";

    $mail->send();

    echo "<p style='color: green; font-weight: bold;'>✅ SUCCESS: Test email sent successfully!</p>";
    echo "<p>Please check your inbox at <strong>{$testEmail}</strong>.</p>";

} catch (Exception $e) {
    echo "<p style='color: red; font-weight: bold;'>❌ ERROR: Message could not be sent.</p>";
    echo "<p><strong>Error:</strong> " . htmlspecialchars($mail->ErrorInfo) . "</p>";
    echo "<p>Common issues:</p>";
    echo "<ul>";
    echo "<li>Incorrect username or password</li>";
    echo "<li>Wrong SMTP host or port</li>";
    echo "<li>Firewall or hosting restrictions on outgoing SMTP</li>";
    echo "<li>For SiteGround: Make sure you're using the correct hostname from Site Tools</li>";
    echo "</ul>";
}
?>