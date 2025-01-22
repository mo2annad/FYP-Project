Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    // Products
    Route::resource('products', ProductController::class);
    Route::post('products/featured/{id}', [ProductController::class, 'toggleFeatured']);
    
    // Promotions
    Route::resource('promotions', PromotionController::class);
    
    // Contact Queries
    Route::get('queries', [ContactController::class, 'index']);
    Route::patch('queries/{id}/status', [ContactController::class, 'updateStatus']);
    
    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
}); 