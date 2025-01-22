@extends('layouts.admin')

@section('content')
<div class="container">
    <div class="row">
        <!-- Stats Cards -->
        <div class="col-md-3">
            <div class="card">
                <div class="card-body">
                    <h5>Total Products</h5>
                    <h2>{{ $productsCount }}</h2>
                </div>
            </div>
        </div>
        
        <!-- Active Promotions -->
        <div class="col-md-12 mt-4">
            <h4>Active Promotions</h4>
            <table class="table">
                <!-- Table content -->
            </table>
        </div>
        
        <!-- Recent Queries -->
        <div class="col-md-12 mt-4">
            <h4>Recent Queries</h4>
            <table class="table">
                <!-- Table content -->
            </table>
        </div>
    </div>
</div>
@endsection 